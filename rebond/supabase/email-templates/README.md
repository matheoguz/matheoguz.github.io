# E-mails de connexion en français

À coller dans Supabase > Authentication > Email Templates :

| Modèle Supabase | Fichier | Objet conseillé |
|---|---|---|
| Confirm signup | `confirmation.html` | Active ton compte Rebond |
| Reset password | `recovery.html` | Ton nouveau mot de passe Rebond |
| Change email address | `email-change.html` | Confirme ta nouvelle adresse e-mail |

`{{ .ConfirmationURL }}` est remplacé par Supabase au moment de l'envoi.
