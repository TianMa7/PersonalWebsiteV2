import "./Header.css";

function Header() {
    return (
        <header className="header">
            <nav aria-label="Main navigation">
                <ul>
                    <li>Home</li>
                    <li>Projects</li>
                    <li>Experience</li>
                    <li>Contact</li>
                </ul>
            </nav>
        </header>
    );
}

export default Header;