function Khteamup({ khColor = "#0046b0", khFont = 30 }) {
  return (
    <h1 style={{ color: "white", fontFamily: "Poppins", fontSize: khFont, fontWeight: 600 }} className="teamup">
      <span style={{ color: khColor }}>KH </span> TEAMUP
    </h1>
  );
}

export default Khteamup;