const express = require('express');
const router = express.Router();
const userController = require('./controllers/usersController');
const groupController = require('./controllers/groupControllers')
const betController = require('./controllers/betControllers')
const matchController = require('./controllers/matchesControllers')
const adminController = require('./controllers/adminControllers')
const supportController = require('./controllers/supportControllers')
const portfolioController = require('./controllers/portfolioControllers')
const userConnectedVerif = require('./utils/jwt.verify');

router.get('/', (req, res) => {
    console.log(req.cookies)
    res.json({
        token: req?.cookies?.token
    })
})
router.post('/portfolio/send-email', portfolioController.sendEmail) // Connexion + JWT 
router.put('/signup-action', userController.signupAction) // Inscription
router.post('/login-action', userController.loginAction) // Connexion + JWT 
router.post('/forgot-password', userController.forgotPasswordRequest) // Demander un nouveau mot de passe
router.post('/forgot-password/:recoveryCode/changepassword', userController.forgotPasswordAction) // Changer mot de passe
router.get('/fortgot-password/:recoveryCode/verifyrecovery', userController.checkRecoveryCode) // Inscription
router.delete('/logout-action', userController.logoutAction) // Refresh Token
router.get('/refresh-token', userController.refreshToken) // Refresh Token
router.put('/create-group', userConnectedVerif, groupController.groupCreation) //Créer un groupe
router.get('/infos/user', userConnectedVerif, userController.findUserById) // Avoir Infos de Un User
router.post('/infos/user/details/username', userConnectedVerif, userController.findUserByUsername) // Avoir Infos de Un User Par son username
router.patch('/infos/user/username', userConnectedVerif, userController.updateUsernameByUserId) // Modifier username
router.patch('/infos/user/email', userConnectedVerif, userController.updateEmailByUserId) // Modifier username
router.patch('/infos/user/firstname', userConnectedVerif, userController.updateFirstnameByUserId) // Modifier username
router.patch('/infos/user/lastname', userConnectedVerif, userController.updateLastnameByUserId) // Modifier username
router.patch('/infos/user/password', userConnectedVerif, userController.updatePasswordByUserId) // Modifier mot de passe d'un user
router.patch('/infos/user/picture', userConnectedVerif, userController.updateAvatarByUserId) // Modifier avatar d'un user
router.get('/infos/group/:name/matchs', userConnectedVerif, groupController.getMatchsInfosByGroupName) //Récupérer les matchs d'un groupe par leur nom
router.get('/invite/:invitation_link', userConnectedVerif, groupController.joinGroup) // Rejoindre un groupe grace à une invitation
router.post('/join-private-group/:group_id', userConnectedVerif, groupController.joinPrivateGroup) // Rejoindre un groupe privé
router.delete('/delete-group/group/:group_id', userConnectedVerif, groupController.deleteGroup) // Supprimer/Quitter un groupe
router.delete('/delete-account', userConnectedVerif, userController.deleteUser) // Supprimer son compte
router.get('/list/rank/group/details/:group_id', userConnectedVerif, groupController.rankingOfGroup) // Lister le classement d'un groupe, ainsi que les pronostics fait du user, les matchs finis, en cours, annulé...
router.get('/list/rank/group/:group_id', userConnectedVerif, groupController.SimpleRankingOfGroup) // Lister le classement d'un groupe
router.get('/list/groups/user', userConnectedVerif, groupController.getGroupByUserId) // Lister les groupes d'un utilisateur + statut hasBet
router.get('/update-points/group/:group_id', userConnectedVerif, betController.updatePointsByGroup) // Distribution des KoalaCoins
router.get('/list/matchs/group/:group_id', userConnectedVerif, groupController.getMatchsInfosByGroupId) // Lister infos des matchs par group_id
router.get('/list/matchs/upcoming', matchController.getMatchsUpcoming) // Lister infos des matchs par group_id
router.get('/list/matchs', userConnectedVerif, matchController.getMatchsOfAllGame) // Lister tout les matchs
router.get('/list/rank', userConnectedVerif, userController.getRank) // Lister le classement général du site
router.put('/create-ticket', userConnectedVerif, userController.createTicketUser) // Créer un ticket en tant qu'user
router.get('/list-tickets', userConnectedVerif, userController.listTickets) // Récupérer les tickets d'un user
router.get('/list-messages/:ticket_id', userConnectedVerif, supportController.getAllMessagesOfTicketUser) // Récupérer message d'un ticket (coté user)
router.delete('/delete-ticket/:ticket_id', userConnectedVerif, supportController.deleteTicketUser) // Supprimer un ticket (coté user)
router.patch('/verify-bet/group/:group_id', userConnectedVerif, betController.verifyBetByGroup) // Vérifier les bets d'un groupe
router.patch('/verify-bet/group/:group_id', userConnectedVerif, betController.verifyBetByGroup) // Vérifier les bets d'un groupe
router.put('/create-bet/group/:group_id', userConnectedVerif, betController.submitBet) // Créer son pronostic par rapport à un groupe
router.get('/admin/list-users', userConnectedVerif, adminController.getAllUsersOfWebsite) // Récupérer la liste de tous les users du site
router.get('/admin/list-users/some-infos', userConnectedVerif, adminController.getAllUsersOfWebsiteSomeDetails) // Récupérer la liste de tous les users du site
router.get('/admin/list-details/user/:id', userConnectedVerif, adminController.getInfosOfUser) // Récupérer les infos d'un utilisateur
router.delete('/admin/delete-user/:id', userConnectedVerif, adminController.deleteUser) // Supprimer un utilisateur en tant qu'admin
router.patch('/admin/close-ticket/:ticket_id', userConnectedVerif, supportController.closeTicket) // Fermer un ticket
router.get('/admin/list-tickets', userConnectedVerif, adminController.getAllTickets) // Récupérer les tickets entre admin et users
router.get('/admin/list-messages/:ticket_id', userConnectedVerif, adminController.getAllMessagesOfTicket) // Récupérer message d'un ticket
router.put('/send-message/:ticket_id', userConnectedVerif, supportController.sendMessageToTicket) // Envoyer un message au ticket
router.put('/admin/create-ticket', userConnectedVerif, adminController.createTicket) // Créer un ticket en tant qu'admin
router.delete('/admin/delete-ticket/:ticket_id', userConnectedVerif, adminController.deleteTicket) // Supprimer un ticket
router.patch('/admin/infos/user', userConnectedVerif, adminController.editUserInfosByAdmin) // Modifier les infos d'un utilisateur
router.delete('/admin/delete-user/:id', userConnectedVerif, adminController.deleteUserByAdmin) // Supprimer un utilisateur
module.exports = router;