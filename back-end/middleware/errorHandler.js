module.exports = (err, req, res, next) => {
  console.error("🔥 Erreur :", err);
  res.status(500).json({ message: "Erreur interne du serveur" });
};
