import "./Empty.css";
import { Link } from "react-router-dom";

const sections = [
    {
        title: "Pokemon Role Playing Games",
        items: [
            {
                title: "Pokemon Generator",
                href: "/pokemon-generator",
                description: "Build a Pokemon sheet with level, rarity, abilities, stats, moves, and export-oriented data in one place.",
            },
            {
                title: "Pokemon Rolls",
                href: "/pokemon-rolls",
                description: "Handle encounter, capture, shiny, and card rolls with dedicated utilities and quick result feedback.",
            },
            {
                title: "Pokemon Team Card",
                href: "/pokemon-team-card",
                description: "Pick up to six Pokemon in order, upload a custom image, and export a 480p team card with the full squad layout.",
            },
            {
                title: "Pokemon Encounter Generator",
                href: "/pokemon-encounter-generator",
                description: "Create encounter zones with common, uncommon, rare, and super rare sections, then load or save them as JSON files.",
            },
        ],
    },
    {
        title: "Japanese Learning",
        items: [
            {
                title: "Hiragana Training",
                href: "/hiragana-training",
                description: "Practice hiragana in both directions: read kana into romaji or match romaji back to the correct hiragana.",
            },
            {
                title: "Katakana Training",
                href: "/katakana-training",
                description: "Train katakana with the same two quiz modes and score tracking to keep repetition simple and continuous.",
            },
        ],
    },
];

function Empty() {
    return (
        <div className="home-page">
            <section className="home-hero">
                <p className="home-kicker">Faeres Dev Website</p>
                <h1>Six focused tools in one place.</h1>
                <p className="home-subtitle">
                    Use the navigation above to switch between Pokemon utilities and Japanese writing practice.
                </p>
            </section>

            <section className="home-sections">
                {sections.map((section) => (
                    <div className="home-section" key={section.title}>
                        <div className="home-section-header">
                            <h2>{section.title}</h2>
                        </div>
                        <div className="home-grid">
                            {section.items.map((item) => (
                                <article className="home-card" key={item.title}>
                                    <h3>
                                        <Link className="home-card-link" to={item.href}>
                                            {item.title}
                                        </Link>
                                    </h3>
                                    <p>{item.description}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                ))}
            </section>
        </div>
    );
}

export default Empty;
