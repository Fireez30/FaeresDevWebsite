import "./Empty.css";

const sections = [
    {
        title: "Pokemon Role Playing Games",
        items: [
            {
                title: "Pokemon Generator",
                description: "Build a Pokemon sheet with level, rarity, abilities, stats, moves, and export-oriented data in one place.",
            },
            {
                title: "Pokemon Rolls",
                description: "Handle encounter, capture, shiny, and card rolls with dedicated utilities and quick result feedback.",
            },
        ],
    },
    {
        title: "Japanese Learning",
        items: [
            {
                title: "Hiragana Training",
                description: "Practice hiragana in both directions: read kana into romaji or match romaji back to the correct hiragana.",
            },
            {
                title: "Katakana Training",
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
                <h1>Four focused tools in one place.</h1>
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
                                    <h3>{item.title}</h3>
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
