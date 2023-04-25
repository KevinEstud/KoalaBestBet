require('dotenv').config();
const admin = require('../dataMappers/admin')
const jwt = require('jsonwebtoken');
const supportController = {
    sendMessageToTicket: async (req, res) => {
    const { text } = req?.body?.data
    const {ticket_id} = req.params
    if(!req?.cookies?.jwt) {
        return res.status(200).json({error: 'Token Manquant !'})
      }
      if(!text || text.length > 255) {
        return res.status(200).json({error: 'Veuillez saisir un message entre 0 et 255 Caractères.'})
      }
      if(!ticket_id) {
        return res.status(200).json({error: 'Veuillez vérifier le ticket_id.'})
      }
      try {
        const userInfos = jwt.decode(req.cookies.jwt, process.env.JWT_REFRESH_SECRET, (err, user) => {
          if (err) return res.status(403).send({
            error: 'Token Invalide !'
          })
          return user;
        })
        const checkifusercan = await admin.checkIfUserCanSendToTicket(userInfos?.userId, ticket_id)
        if(checkifusercan) {
            await admin.submitMessageToTicket(ticket_id, userInfos?.userId, text).then( async (e) => {
                const checkifadmin = await admin.checkIfAdmin(userInfos?.userId)
                if(checkifadmin.bool) {
                    await admin.updateTicketToAnswered(ticket_id)
                } else {
                    await admin.updateTicketToInProgress(ticket_id)
                }
                return res.status(201).json({
                    success:'Message bien envoyé.',
                    tickets_infos: e
                })
            })
        } else {
            return res.status(200).json({
                error: 'Veuillez vérifier le ticket_id.'
              })
        }
      } catch (e) {
        return res.status(200).json({
          error: 'Un Problème est survenu.'
        })
      }
},
closeTicket: async (req, res) => {
    const { ticket_id } = req.params
    if(!req?.cookies?.jwt) {
      return res.status(200).json({error: 'Token Manquant !'})
    }
    if(!ticket_id || ticket_id.length !== 8) {
      return res.status(200).json({error: 'Veuillez vérifier le code de votre ticket.'})
    }
    try {
      const userInfos = jwt.decode(req.cookies.jwt, process.env.JWT_REFRESH_SECRET, (err, user) => {
        if (err) return res.status(403).send({
          error: 'Token Invalide !'
        })
        return user;
      })
      const checkifadmin = await admin.checkIfAdmin(userInfos?.userId)
      if(!checkifadmin.bool) {
          return res.status(200).json({error: 'Vous n\'avez pas accès à cette partie.'})
      }
      const tickets = await admin.updateTicketToClosed(ticket_id)
      if(!tickets) {
        return res.status(200).json({error: 'Veuillez vérifier le code de votre ticket.'})
      }
      return res.status(201).json({success: "Ticket fermé avec succès."})
    } catch (e) {
      return res.status(200).json({
        error: 'Un Problème est survenu.'
      })
    }
  },
  deleteTicketUser: async (req, res) => {
    const { ticket_id } = req.params
    if(!req?.cookies?.jwt) {
      return res.status(200).json({error: 'Token Manquant !'})
    }
    if(!ticket_id || ticket_id.length !== 8) {
      return res.status(200).json({error: 'Veuillez vérifier le code de votre ticket.'})
    }
    try {
      const userInfos = jwt.decode(req.cookies.jwt, process.env.JWT_REFRESH_SECRET, (err, user) => {
        if (err) return res.status(403).send({
          error: 'Token Invalide !'
        })
        return user;
      })
      const checkifusercan = await admin.checkIfUserCanSendToTicket(userInfos?.userId, ticket_id)
      if(checkifusercan) {
          await admin.deleteTicket(ticket_id).then((e) => {
            return res.status(201).json({success: "Ticket fermé avec succès."})
          })
        } else {
            return res.status(200).json({error: 'Veuillez vérifier le code de votre ticket.'})
        }
    } catch (e) {
      return res.status(200).json({
        error: 'Un Problème est survenu.'
      })
    }
  },
  getAllMessagesOfTicketUser: async (req, res) => {
    const { ticket_id } = req.params
    if(!req?.cookies?.jwt) {
      return res.status(200).json({error: 'Token Manquant !'})
    }
    if(!ticket_id || ticket_id.length !== 8) {
      return res.status(200).json({error: 'Veuillez vérifier le code de votre ticket.'})
    }
    try {
      const userInfos = jwt.decode(req.cookies.jwt, process.env.JWT_REFRESH_SECRET, (err, user) => {
        if (err) return res.status(403).send({
          error: 'Token Invalide !'
        })
        return user;
      })
      const checkifusercan = await admin.checkIfUserCanSendToTicket(userInfos?.userId, ticket_id)
      if(!checkifusercan) {
          return res.status(200).json({error: 'Veuillez vérifier le code de votre ticket.'})
      }
      const tickets = await admin.listTicketByCode(ticket_id)
      if(!tickets) {
        return res.status(200).json({error: 'Veuillez vérifier le code de votre ticket.'})
      }
      return res.status(201).json(tickets)
    } catch (e) {
      return res.status(200).json({
        error: 'Un Problème est survenu.'
      })
    }
  },
};
module.exports = supportController;