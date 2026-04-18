import icon from '../assets/random.svg';

export default function GenerateButton({ onClick }: { onClick: () => void }) {
    return (
        <button className="generate-button header-button" onClick={onClick}>
            <img src={icon} />
        </button>
    )
}