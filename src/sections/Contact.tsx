import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import {
    CONTACT_FORM_ENDPOINT,
    CONTACT_FORM_SUBJECT,
    CONTACT_MAX_EMAIL_LENGTH,
    CONTACT_MAX_MESSAGE_LENGTH,
    CONTACT_MAX_NAME_LENGTH,
    CONTACT_MIN_FILL_TIME_MS,
    CONTACT_TURNSTILE_ACTION,
    CONTACT_TURNSTILE_SITE_KEY,
} from '../config/contact.ts';
import './Contact.css';

const TURNSTILE_WAIT_MS = 10000;

type TurnstileOptions = {
    sitekey: string;
    action: string;
    theme: 'auto';
    size: 'flexible';
    appearance: 'interaction-only';
    callback: (token: string) => void;
    'expired-callback': () => void;
    'error-callback': (errorCode: string) => void;
    'timeout-callback': () => void;
};

type TurnstileApi = {
    render: (container: HTMLElement, options: TurnstileOptions) => string;
    reset: (widgetId?: string) => void;
    remove: (widgetId: string) => void;
};

type TurnstileWindow = Window & { turnstile?: TurnstileApi };

type FieldErrors = {
    name?: string;
    email?: string;
    message?: string;
};

type FormspreeError = {
    field?: string | null;
    message?: string;
    code?: string;
};

type FormspreeResponse = {
    ok?: boolean;
    errors?: FormspreeError[];
};

const TURNSTILE_ERROR_MESSAGE =
    "Human verification couldn't load. Please refresh the page and try again.";

function useTurnstile() {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);
    const tokenRef = useRef<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) {
            return;
        }

        let cancelled = false;
        let widgetId: string | null = null;
        let pollId: number | undefined;
        let renderTimerId: number | undefined;
        let loadTimeoutId: number | undefined;

        const renderWidget = () => {
            if (cancelled || widgetId) {
                return;
            }

            const api = (window as TurnstileWindow).turnstile;
            if (!api) {
                return;
            }

            try {
                widgetId = api.render(container, {
                    sitekey: CONTACT_TURNSTILE_SITE_KEY,
                    action: CONTACT_TURNSTILE_ACTION,
                    theme: 'auto',
                    size: 'flexible',
                    appearance: 'interaction-only',
                    callback: (token) => {
                        tokenRef.current = token;
                        setError(null);
                    },
                    'expired-callback': () => {
                        tokenRef.current = null;
                    },
                    'error-callback': () => {
                        tokenRef.current = null;
                        setError(TURNSTILE_ERROR_MESSAGE);
                    },
                    'timeout-callback': () => {
                        tokenRef.current = null;
                    },
                });
                widgetIdRef.current = widgetId;
                if (loadTimeoutId !== undefined) {
                    window.clearTimeout(loadTimeoutId);
                    loadTimeoutId = undefined;
                }
            } catch {
                setError(TURNSTILE_ERROR_MESSAGE);
            }
        };

        const scheduleRender = () => {
            if (cancelled || widgetId) {
                return;
            }
            renderTimerId = window.setTimeout(renderWidget, 0);
        };

        const waitForApi = () => {
            if ((window as TurnstileWindow).turnstile) {
                scheduleRender();
                return;
            }

            pollId = window.setInterval(() => {
                if (cancelled) {
                    return;
                }
                if ((window as TurnstileWindow).turnstile) {
                    if (pollId !== undefined) {
                        window.clearInterval(pollId);
                        pollId = undefined;
                    }
                    scheduleRender();
                }
            }, 200);

            loadTimeoutId = window.setTimeout(() => {
                if (!cancelled && !widgetId) {
                    setError(TURNSTILE_ERROR_MESSAGE);
                }
            }, TURNSTILE_WAIT_MS);
        };

        waitForApi();

        return () => {
            cancelled = true;
            if (pollId !== undefined) {
                window.clearInterval(pollId);
            }
            if (renderTimerId !== undefined) {
                window.clearTimeout(renderTimerId);
            }
            if (loadTimeoutId !== undefined) {
                window.clearTimeout(loadTimeoutId);
            }
            if (widgetId) {
                try {
                    (window as TurnstileWindow).turnstile?.remove(widgetId);
                } catch {
                    // The widget can already be gone when the page is unloaded.
                }
            }
            widgetIdRef.current = null;
            tokenRef.current = null;
        };
    }, []);

    const reset = () => {
        tokenRef.current = null;
        const widgetId = widgetIdRef.current;
        const api = (window as TurnstileWindow).turnstile;
        if (!api || !widgetId) {
            return;
        }
        try {
            api.reset(widgetId);
        } catch {
            // A missing widget is harmless; the next submission will be blocked.
        }
    };

    return {
        containerRef,
        getToken: () => tokenRef.current,
        reset,
        error,
    };
}

function CheckIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path
                d="M20 6 9 17l-5-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

interface ContactFormProps {
    autoFocusName?: boolean;
    onSuccess: () => void;
}

function ContactForm({ autoFocusName = false, onSuccess }: ContactFormProps) {
    const { containerRef, getToken, reset, error: turnstileError } =
        useTurnstile();
    const nameRef = useRef<HTMLInputElement>(null);
    const startedAtRef = useRef(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

    useEffect(() => {
        startedAtRef.current = Date.now();
        if (autoFocusName) {
            nameRef.current?.focus();
        }
    }, [autoFocusName]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isSubmitting) {
            return;
        }

        const form = event.currentTarget;
        const formData = new FormData(form);
        const gotcha = formData.get('_gotcha');

        // A filled hidden field is a bot signal. Pretend it worked and send
        // nothing; this also avoids consuming a Formspree submission.
        if (typeof gotcha === 'string' && gotcha.trim().length > 0) {
            form.reset();
            onSuccess();
            return;
        }

        const elapsed = Date.now() - startedAtRef.current;
        if (elapsed > 0 && elapsed < CONTACT_MIN_FILL_TIME_MS) {
            setFieldErrors({});
            setFormError(
                'Please take a moment to review your message, then try again.',
            );
            return;
        }

        const token = getToken();
        if (!token) {
            setFormError(
                turnstileError ??
                    'Verification is still loading. Please wait a moment and try again.',
            );
            return;
        }

        formData.set('cf-turnstile-response', token);
        setIsSubmitting(true);
        setFormError(null);
        setFieldErrors({});
        let succeeded = false;

        try {
            const response = await fetch(CONTACT_FORM_ENDPOINT, {
                method: 'POST',
                headers: { Accept: 'application/json' },
                body: formData,
                signal: AbortSignal.timeout(15000),
            });
            const data = (await response
                .json()
                .catch(() => null)) as FormspreeResponse | null;

            if (
                response.ok &&
                data?.ok !== false &&
                !data?.errors?.length
            ) {
                succeeded = true;
                form.reset();
                onSuccess();
                return;
            }

            if (response.status === 429) {
                setFormError(
                    'Too many messages have been sent recently. Please try again later.',
                );
                return;
            }

            if (response.status === 403) {
                setFormError(
                    "Verification failed. Please refresh the page and try again.",
                );
                return;
            }

            const errors = data?.errors ?? [];
            const nextFieldErrors: FieldErrors = {};
            const formMessages: string[] = [];

            for (const item of errors) {
                const message = item.message?.trim();
                if (!message) {
                    continue;
                }
                if (
                    item.field === 'name' ||
                    item.field === 'email' ||
                    item.field === 'message'
                ) {
                    nextFieldErrors[item.field] = message;
                } else {
                    formMessages.push(message);
                }
            }

            setFieldErrors(nextFieldErrors);
            const firstInvalidField = (
                ['name', 'email', 'message'] as const
            ).find((field) => nextFieldErrors[field]);
            if (firstInvalidField) {
                form
                    .querySelector<
                        HTMLInputElement | HTMLTextAreaElement
                    >(`[name="${firstInvalidField}"]`)
                    ?.focus();
            }

            if (formMessages.length > 0) {
                setFormError(formMessages.join(' '));
            } else if (response.status >= 500) {
                setFormError(
                    'Something went wrong while sending your message. Please try again.',
                );
            } else {
                setFormError(
                    "Your message couldn't be sent. Please check the form and try again.",
                );
            }
        } catch {
            setFormError(
                "Couldn't send your message. Check your connection and try again.",
            );
        } finally {
            if (!succeeded) {
                setIsSubmitting(false);
                reset();
            }
        }
    };

    return (
        <form
            className="contact__form"
            action={CONTACT_FORM_ENDPOINT}
            method="POST"
            aria-label="Contact form"
            aria-busy={isSubmitting}
            onSubmit={handleSubmit}
        >
            <input
                type="hidden"
                name="_subject"
                value={CONTACT_FORM_SUBJECT}
            />

            <div className="contact__honeypot" aria-hidden="true">
                <label htmlFor="contact-gotcha">Leave this field empty</label>
                <input
                    id="contact-gotcha"
                    type="text"
                    name="_gotcha"
                    tabIndex={-1}
                    autoComplete="off"
                    readOnly
                />
            </div>

            <div className="contact__row">
                <div className="contact__field">
                    <label className="contact__label" htmlFor="contact-name">
                        Name
                    </label>
                    <input
                        ref={nameRef}
                        className="contact__input"
                        id="contact-name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        maxLength={CONTACT_MAX_NAME_LENGTH}
                        placeholder="Your name"
                        required
                        aria-invalid={fieldErrors.name ? true : undefined}
                        aria-describedby={
                            fieldErrors.name ? 'contact-name-error' : undefined
                        }
                    />
                    {fieldErrors.name ? (
                        <p
                            className="contact__field-error"
                            id="contact-name-error"
                        >
                            {fieldErrors.name}
                        </p>
                    ) : null}
                </div>

                <div className="contact__field">
                    <label className="contact__label" htmlFor="contact-email">
                        Email
                    </label>
                    <input
                        className="contact__input"
                        id="contact-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        maxLength={CONTACT_MAX_EMAIL_LENGTH}
                        placeholder="you@example.com"
                        required
                        aria-invalid={fieldErrors.email ? true : undefined}
                        aria-describedby={
                            fieldErrors.email
                                ? 'contact-email-error'
                                : undefined
                        }
                    />
                    {fieldErrors.email ? (
                        <p
                            className="contact__field-error"
                            id="contact-email-error"
                        >
                            {fieldErrors.email}
                        </p>
                    ) : null}
                </div>
            </div>

            <div className="contact__field">
                <label className="contact__label" htmlFor="contact-message">
                    Message
                </label>
                <textarea
                    className="contact__input contact__textarea"
                    id="contact-message"
                    name="message"
                    rows={5}
                    maxLength={CONTACT_MAX_MESSAGE_LENGTH}
                    placeholder="What's on your mind?"
                    required
                    aria-invalid={fieldErrors.message ? true : undefined}
                    aria-describedby={
                        fieldErrors.message
                            ? 'contact-message-error'
                            : undefined
                    }
                />
                {fieldErrors.message ? (
                    <p
                        className="contact__field-error"
                        id="contact-message-error"
                    >
                        {fieldErrors.message}
                    </p>
                ) : null}
            </div>

            <div className="contact__turnstile" ref={containerRef} />

            {turnstileError ? (
                <p className="contact__field-error" role="alert">
                    {turnstileError}
                </p>
            ) : null}

            {formError ? (
                <div className="contact__alert" role="alert">
                    {formError}
                </div>
            ) : null}

            <button
                className="contact__button"
                type="submit"
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Sending…' : 'Send message'}
            </button>

            <p className="contact__privacy">
                Protected by Cloudflare Turnstile. Your details are only used
                to reply.
            </p>
        </form>
    );
}

function ContactSuccess({ onRestart }: { onRestart: () => void }) {
    const headingRef = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
        headingRef.current?.focus();
    }, []);

    return (
        <div className="contact__success" role="status">
            <span className="contact__success-icon" aria-hidden="true">
                <CheckIcon />
            </span>
            <h3
                className="contact__success-title"
                ref={headingRef}
                tabIndex={-1}
            >
                Message sent
            </h3>
            <p>
                Thanks for reaching out — I'll reply to the email you
                provided.
            </p>
            <button
                type="button"
                className="contact__button contact__button--secondary"
                onClick={onRestart}
            >
                Send another message
            </button>
        </div>
    );
}

function Contact() {
    const [view, setView] = useState<'form' | 'success'>('form');
    const [formKey, setFormKey] = useState(0);

    const handleSuccess = () => setView('success');

    const handleRestart = () => {
        setFormKey((key) => key + 1);
        setView('form');
    };

    return (
        <section
            className="contact"
            id="contact"
            aria-labelledby="contact-heading"
        >
            <div className="contact__header">
                <p className="contact__eyebrow">Contact</p>
                <h2 className="contact__title" id="contact-heading">
                    Get in touch
                </h2>
                <p className="contact__lede">
                    Have a question, an opportunity, or just want to say
                    hello? Send a message and I'll get back to you.
                </p>
            </div>

            <div className="contact__panel">
                {view === 'form' ? (
                    <ContactForm
                        key={formKey}
                        autoFocusName={formKey > 0}
                        onSuccess={handleSuccess}
                    />
                ) : (
                    <ContactSuccess onRestart={handleRestart} />
                )}
            </div>
        </section>
    );
}

export default Contact;
