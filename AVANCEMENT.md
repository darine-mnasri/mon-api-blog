# Avancement du projet — renouvellement du mot de passe

## Fonctionnalité réalisée

L'utilisateur connecté peut modifier son mot de passe avec l'endpoint :

```http
PUT /api/users/update-password
```

La route est protégée par le middleware `protect` et attend les champs
`oldPassword` et `newPassword` dans le corps JSON. Le mot de passe actuel est
vérifié avec bcrypt. Le nouveau mot de passe doit contenir au moins 6
caractères ; il est haché avec un nouveau sel avant l'enregistrement.

## Tester avec Postman

### Préparation

1. Vérifier que MongoDB et les variables d'environnement du projet sont
   configurés, notamment `MONGODB_URI` et `JWT_SECRET`.
2. Démarrer l'API depuis le terminal :

   ```bash
   npm run dev
   ```

3. Utiliser `http://localhost:3000` comme URL de base, sauf si `PORT` est
   configuré différemment.
4. Dans Postman, sélectionner **Body > raw > JSON** pour les requêtes qui
   contiennent un corps. Utiliser un compte existant et ses identifiants
   actuels.

### 1. Se connecter avec le mot de passe actuel

```http
POST http://localhost:3000/api/users/login
Content-Type: application/json
```

```json
{
  "email": "votre-email@example.com",
  "password": "votre-mot-de-passe-actuel"
}
```

Résultat attendu : **200 OK**, avec un `token` dans la réponse. Copiez-le pour
la requête suivante. Vous pouvez aussi le conserver dans une variable
d'environnement Postman appelée `token`.

### 2. Renouveler le mot de passe

```http
PUT http://localhost:3000/api/users/update-password
Authorization: Bearer <TOKEN_REÇU À L'ÉTAPE 1>
Content-Type: application/json
```

Dans Postman, l'en-tête peut être configuré dans **Authorization > Bearer
Token** en y collant le token. Avec une variable Postman, utilisez
`{{token}}`.

```json
{
  "oldPassword": "votre-mot-de-passe-actuel",
  "newPassword": "MonNouveauMotDePasse123"
}
```

Résultat attendu : **200 OK**.

```json
{
  "message": "Mot de passe mis à jour avec succès"
}
```

### 3. Vérifier la reconnexion avec le nouveau mot de passe

```http
POST http://localhost:3000/api/users/login
Content-Type: application/json
```

```json
{
  "email": "votre-email@example.com",
  "password": "MonNouveauMotDePasse123"
}
```

Résultat attendu : **200 OK** avec un nouveau `token`. Cela confirme que le
nouveau mot de passe est enregistré et utilisable.

### 4. Vérifier que l'ancien mot de passe ne fonctionne plus

Renvoyer la requête de connexion précédente en remplaçant le mot de passe par
l'ancien.

Résultat attendu : **401 Unauthorized**.

```json
{
  "message": "Identifiants invalides"
}
```

## Vérifications complémentaires

Effectuer ces tests sans remplacer le mot de passe, ou après avoir réussi les
tests principaux :

| Cas | Requête / donnée | Résultat attendu |
| --- | --- | --- |
| Appel sans token | `PUT /api/users/update-password` sans Authorization | **401 Unauthorized** |
| Ancien mot de passe erroné | Token valide, `oldPassword` incorrect | **401 Unauthorized**, message `Ancien mot de passe incorrect` |
| Nouveau mot de passe trop court | Token valide, `newPassword` de moins de 6 caractères | **400 Bad Request** |
| Champ manquant | Omettre `oldPassword` ou `newPassword` | **400 Bad Request** |

Ne partagez pas votre token ou vos vrais mots de passe ; utilisez des variables
d'environnement locales dans Postman si nécessaire.

## Articles personnels et attribution de rôle

### Articles de l'utilisateur connecté

La route protégée `GET /api/articles/my-articles` retourne uniquement les
articles dont l'auteur correspond à l'utilisateur identifié par le token. Dans
Postman, configurez **Authorization > Bearer Token**, puis envoyez :

```http
GET http://localhost:3000/api/articles/my-articles
```

Sans token valide, le résultat attendu est **401 Unauthorized**.

### Attribution du rôle administrateur

L'inscription publique ignore tout rôle transmis par le client et crée toujours
un compte avec le rôle `user`. Seul un administrateur connecté peut attribuer
le rôle `admin` avec :

```http
PUT http://localhost:3000/api/users/ID_UTILISATEUR/role
Authorization: Bearer <TOKEN_ADMIN>
Content-Type: application/json
```

```json
{
  "role": "admin"
}
```

Résultat attendu : **200 OK** et une réponse confirmant l'attribution du rôle.
Un utilisateur non administrateur reçoit **403 Forbidden** ; un appel sans
token valide reçoit **401 Unauthorized**. La requête doit contenir exactement
`"role": "admin"`, sinon l'API répond **400 Bad Request**.

## Expiration du jeton JWT

Le middleware `protect` renvoie un message dédié lorsque le JWT a expiré :

```json
{
  "message": "Votre session a expire , veuillez vous reconnecter"
}
```

Pour tester rapidement dans Postman :

1. Dans `controllers/userController.js`, modifiez temporairement `expiresIn`
   dans `generateToken` de `'1d'` à `'10s'`, puis redémarrez l'API si nécessaire.
2. Connectez-vous avec `POST http://localhost:3000/api/users/login` et
   conservez le nouveau `token` renvoyé.
3. Attendez au moins 15 secondes.
4. Envoyez `GET http://localhost:3000/api/users/profile` avec ce token dans
   **Authorization > Bearer Token**.
5. Vérifiez la réponse **401 Unauthorized** et le message JSON ci-dessus.
6. Rétablissez impérativement `expiresIn: '1d'`, redémarrez l'API et
   reconnectez-vous pour obtenir un token valide.

Un token émis avant le changement de durée garde sa date d'expiration initiale ;
il faut donc se reconnecter après avoir activé la durée temporaire de 10 secondes.
