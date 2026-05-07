import "./Home.css";
import { Link } from "react-router-dom";

const sections = [
    {
        title: "Pokemon Role Playing Game",
        items: [
            {
                title: "Pokemon Generator",
                href: "/pokemon-generator",
                description: "A Pokemon sheet generator, adapted to the current role play game. Data is incomplete, being curated now.",
            },
            {
                title: "Pokemon Dice Rolls",
                href: "/pokemon-rolls",
                description: "Handle expression-like, encounters, capture, shiny, and card rolls for the RPG.",
            },
            {
                title: "Pokemon Team Card",
                href: "/pokemon-team-card",
                description: "A pokemon team card generator, to manage teams or npcs. Only used for visualization, not holding any data.",
            },
            {
                title: "Pokemon Encounter Generator",
                href: "/pokemon-encounter-generator",
                description: "Create encounter zones with common, uncommon, rare, and super rare sections, then load or save them as JSON files. Give the game master the possibility to roll for encounter pokemon species, and count.",
            },
        ],
    },
    {
        title: "Japanese Learning tools",
        items: [
            {
                title: "Hiragana Training cards",
                href: "/hiragana-training",
                description: "Practice hiragana using quizz cards. Includes kana combinations, breaks and elongation rules too.",
            },
            {
                title: "Katakana Training cards",
                href: "/katakana-training",
                description: "Practice katakana using quizz cards. Includes kana combinations, breaks and elongation rules too.",
            },
            {
                title: "Kanji Training cards",
                href: "/kanji-training",
                description: "Practice kanji using quizz cards.",
            },
            {
                title: "Japanese sentences tokens training",
                href: "/japanese-sentence-color-trainer",
                description: "Pratice character groups recognition in a sentence, as quizz cards. Kanji, Hiragana, Katakana, kana combinations, breaks and elongations of vowels.",
            },
            {
                title: "Vocabulary Training",
                href: "/vocabulary-training",
                description: "Practice Japanese vocabulary using quiz cards. See a Japanese word or phrase and pick the correct translation, or the other way around.",
            },
            {
                title: "Katakana Word Trainer",
                href: "/katakana-word-training",
                description: "Practice loanwords in katakana. See a katakana word and type the translation, or see a word and type it in katakana. Uses custom decks from the server.",
            },
        ],
    },
];

function Home() {
    return (
        <div className="home-page">
            <section className="home-hero">
                <h1>Faeres Dev </h1>
                <br/>
                <table>
                    <tr>
                        <th><img className="home-self-img" src="/fireez3.png"/></th>
                        <th><p className="home-subtitle">
                            I'm a 29 years old developer from France. I've worked for virtual reality patient rehabilitation.
                            <br/>
                            I've moved in a team of research an as engineer on a 3D + t data online visualization and curation tool.
                            <br/>
                            Finally, I've joined a biology research team to develop image and data analysis tool, while still working on the 3D +t platform.
                            <br/><br/>
                            I coded this website to :
                            <br/><br/>
                            - Share tools for the Pokemon RPG I'm in
                            <br/>
                            - Share tools I use to learn Japanese
                            <br/>
                            - (Coming) Host images, descriptions and videos of my studies and personal project
                        </p></th>
                    </tr>
                </table>
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

export default Home;
