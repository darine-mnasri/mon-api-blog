const produits = [
    { nom: "Clavier", prix: 45 },
    { nom: "Écran", prix: 320 },
    { nom: "Souris", prix: 25 }
];
const { nom, prix } = produits[0];

console.log(nom, prix);

const souris = produits.find(p => p.nom === "Souris");

console.log(souris.prix);
const produitsPasChers = produits.filter(p => p.prix < 100);

console.log(produitsPasChers);
const avecRemise = prix => prix * 0.9;

console.log(avecRemise(320));