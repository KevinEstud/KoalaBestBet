require('dotenv').config();
const admin = require('../dataMappers/admin')
const users = require('../dataMappers/users');
const onlyLettersNumbersPattern = /^[A-Za-z0-9]+$/;
const LettersAndSpace = /^([a-zA-Z]+\s)*[a-zA-Z]+$/;
const fetch = require('node-fetch')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const emailValidator = require('email-validator');
const adminController = {
    getAllUsersOfWebsite: async (req, res) => {
      if(!req?.cookies?.jwt) {
        return res.status(200).json({error: 'Token Manquant !'})
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
        await admin.listUsersOfWebsite().then((item) => {
          return res.status(201).json(item)
        })
      } catch (e) {
        return res.status(200).json({
          error: 'Un Problème est survenu.'
        })
      }
    },
    getAllUsersOfWebsiteSomeDetails: async (req, res) => {
      if(!req?.cookies?.jwt) {
        return res.status(200).json({error: 'Token Manquant !'})
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
        await admin.listUsersOfWebsiteSomeDetails().then((item) => {
          return res.status(201).json(item)
        })
      } catch (e) {
        return res.status(200).json({
          error: 'Un Problème est survenu.'
        })
      }
    },
    deleteUser: async (req, res) => {
      if(!req?.cookies?.jwt) {
        return res.status(200).json({error: 'Token Manquant !'})
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
        await admin.listUsersOfWebsiteSomeDetails().then((item) => {
          return res.status(201).json(item)
        })
      } catch (e) {
        return res.status(200).json({
          error: 'Un Problème est survenu.'
        })
      }
    },
    getInfosOfUser: async (req, res) => {
      const { id } = req.params
      if(!req?.cookies?.jwt) {
        return res.status(200).json({error: 'Token Manquant !'})
      }
      if(isNaN(id)) {
        return res.status(200).json({error: 'Veuillez vérifier l\'ID.'}) 
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
        await admin.getAllInfosOfUser(id).then((item) => {
          return res.status(201).json(item)
        })
      } catch (e) {
        return res.status(200).json({
          error: 'Un Problème est survenu.'
        })
      }
    },
    editUserInfosByAdmin: async (req, res) => {
    const {
      id,
      username,
      firstname,
      lastname,
      email,
      password
    } = req.body;
    const userN = username?.toLowerCase();
    const emailE = email?.toLowerCase();
    const firstN = firstname?.toLowerCase();
    const lastN = lastname?.toLowerCase();
    try {
      const userInfos = jwt.decode(req.cookies.jwt, process.env.JWT_REFRESH_SECRET, (err, user) => {
        if (err) return res.status(403).send({
          error: 'Token Invalide !'
        })
        return user;
      })
      if (!id || isNaN(id)) return res.status(200).json({
        error: 'Veuillez vérifier l\' ID fournis.'
      })
      
      const checkifadmin = await admin.checkIfAdmin(userInfos?.userId)
      if(checkifadmin.bool) {
        const usertofind = await users.findAllInfosOfUser(id)
        if(!usertofind) return res.status(200).json({
          error: 'Veuillez vérifier l\'ID.'
        })
        if(username) {
          const userDB = usertofind[0].username.toLowerCase();
          if (!username.match(onlyLettersNumbersPattern)) return res.status(200).json({
            error: 'Veuillez vérifier le nom d\'utilisateur saisis.'
          })
          if (username.length > 20) return res.status(200).json({
            error: 'Veuillez Saisir un pseudo de moins de 20 Caractères'
          })
          if (userN === userDB) return res.status(200).json({
            error: 'Aucun changement détecté'
          });
          const user = await users.findByEmail(emailE)
          if (user.length > 0) return res.status(200).json({
            error: 'L\'email à déjà été utilisé'
          });
          const userName = await users.findByUsername(userN);
          if (userName.length != 0) return res.status(200).json({
            error: 'Ce pseudo à déjà été utilisé'
          });
          let newArray = []
          newArray.push({
            username: req.body.username
          })
          await users.updateUser(id, newArray[0]).catch((e) => {
            return res.status(200).json({
              error: 'Un Problème est survenu.'
            })
          })
          return res.status(201).json({
            success: 'Informations Utilisateur mise à jour.'
          })
        }
        if(email) {
          if (!emailValidator.validate(email)) return res.status(200).json({
            error: 'Veuillez saisir un mail valide.'
          });
          const emailDB = usertofind[0].email.toLowerCase();
          if (emailE !== emailDB) {
            const user = await users.findByEmail(emailE)
            if (user.length > 0) return res.status(200).json({
              error: 'L\'email à déjà été utilisé'
            });
            let newArray = []
            newArray.push({
              email: req.body.email
            })
            await users.updateUser(id, newArray[0]).catch((e) => {
              return res.status(200).json({
                error: 'Un Problème est survenu.'
              })
            })
            return res.status(201).json({
              success: 'Informations Utilisateur mise à jour.'
            })
          } else {
            return res.status(200).json({
              error: 'Aucun changement détecté'
            });
          }
        }
        if(firstname) {
          if (firstname.length > 20) return res.status(200).json({
            error: 'Veuillez Saisir un Prénom de moins de 20 Caractères'
          })
          if (!firstname.match(LettersAndSpace)) return res.status(200).json({
            error: 'Veuillez vérifier le prénom saisis.'
          })
          const firstnameDB = usertofind[0].firstname.toLowerCase();
          if(firstnameDB === firstN) {
            return res.status(200).json({
              error: 'Aucun changement détecté'
            });
          } else {
            let newArray = []
            newArray.push({
              firstname: req.body.firstname
            })
            await users.updateUser(id, newArray[0]).catch((e) => {
              return res.status(200).json({
                error: 'Un Problème est survenu.'
              })
            })
          }
        }
        if(lastname) {
          if (lastname.length > 40) return res.status(200).json({
            error: 'Veuillez Saisir un Nom de Famille de moins de 40 Caractères'
          })
          const lastnameDB = usertofind[0].lastname.toLowerCase();
          if (!lastname.match(LettersAndSpace)) return res.status(200).json({
            error: 'Veuillez vérifier le Nom de famille saisis.'
          })
          if(lastnameDB === lastN) {
            return res.status(200).json({
            error: 'Aucun changement détecté.'
          })
        } else {
          let newArray = [];
          newArray.push({
            lastname: req.body.lastname
          })
          await users.updateUser(id, newArray[0]).catch((e) => {
            return res.status(200).json({
              error: 'Un Problème est survenu.'
            })
          })
          return res.status(201).json({
            success: 'Informations Utilisateur mise à jour.'
          })
        }
        }
        if(password) {
          const salt = await bcrypt.genSalt(10);
          const encryptedPassword = await bcrypt.hash(password, salt);
          let newArray = [];
          newArray.push({
            password: encryptedPassword
          })
          await users.updateUser(id, newArray[0]).catch((e) => {
            return res.status(200).json({
              error: 'Un Problème est survenu.'
            })
          })
          return res.status(201).json({
            success: 'Informations Utilisateur mise à jour.'
          })
        }
        return res.status(200).json({
          error: 'Veuillez saisir les infos à modifier.'
        });

      }
      return res.status(200).json({
        error: 'Veuillez vérifier l\' ID fournis.'
      });
    } catch (e) {
      return res.status(200).json({
        error: 'Un Problème est survenu.'
      })
      }
    },
    deleteUserByAdmin: async (req, res) =>  {
      const { id } = req?.params
      try {
        if(isNaN(id)) {
          return res.status(200).json({
            error: 'Veuillez vérifier l\'ID.'
          })
        }
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
          const usertofind = await users.findByIdUser(id).then((res) => res).catch((e) => console.error(e));
          if (usertofind.length != 0) {
            await users.deleteUser(id).catch((e) => {
              return res.status(200).json({
                error: 'Un Problème est survenu.'
              })
            })
            return res.status(201).json({
              success: 'Utilisateur supprimé avec succès.'
            });
  
          }
          return res.status(200).json({
            error: 'Veuillez vérifier l\' ID fournis.'
          });
        } catch (e) {
        return res.status(200).json({
          error: 'Un Problème est survenu.'
        })
      }
    },
    getAllTickets: async function (req, res) {
            if(!req?.cookies?.jwt) {
              return res.status(200).json({error: 'Token Manquant !'})
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
              const tickets = await admin.listTicketsForAdmin()
              if(!tickets) {
                return res.status(200).json({error: 'Aucun tickets d\'ouvert.'})
              }
              return res.status(201).json(tickets)
            } catch (e) {
              return res.status(200).json({
                error: 'Un Problème est survenu.'
              })
            }
    },
    createTicket: async (req, res) => {
        const { receiver_id, subject, text, recaptcha } = req?.body?.data
        if(!req?.cookies?.jwt) {
            return res.status(200).json({error: 'Token Manquant !'})
          }
          const userInfos = jwt.decode(req.cookies.jwt, process.env.JWT_REFRESH_SECRET, (err, user) => {
            if (err) return res.status(403).send({
              error: 'Token Invalide !'
            })
            return user;
          })
          if(!receiver_id || !subject || !text || !recaptcha) {
            return res.status(200).json({error: 'Veuillez vérifier ce que vous avez saisis.'})
          }
          if(isNaN(receiver_id)) {
            return res.status(200).json({error: 'Veuillez vérifier ce que vous avez saisis.'})
          }
          try {
            let recaptcha_success;
            await fetch(
              `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptcha}`, { method: 'POST'}
              ).then(res => res.json()).then(res => {
                if(res.success) {
                  recaptcha_success = true;
                  return res ;
                }
              });
            if(recaptcha_success) {
            const checkifadmin = await admin.checkIfAdmin(userInfos?.userId)
            if(!checkifadmin.bool) {
                return res.status(200).json({error: 'Vous n\'avez pas accès à cette partie.'})
            }
            async function ticketCode() {
                //Je génère mon lien d'invitation
                let ticket_code = require('crypto').randomBytes(4).toString('hex')
                let verify = await admin.listTicketByCode(ticket_code.toLowerCase()).then((res) => res).catch((e) => console.error(e))
                //Je vérifie coté base de donnée qu'un lien identique n'existe pas
                if(verify.length > 0) {
                  //Si c'est le cas je rappel ma fonction pour en générer un autre
                  return ticketCode();
                }
                  //Le cas écheant je return tout simplement le code d'invitation
                return ticket_code ;
              }
              //J'appelle ma fonction invitationLink qui me permettra de générer un code d'invitation et également vérifier que ce dernier n'existe pas déja
              //En base de donnée, le cas écheant, j'en regénère un nouveau
              let ticket_code ;
              await ticketCode().then((e) => ticket_code = e);
              const hoho = await admin.createTicket(ticket_code, subject)
              await admin.addParticipantToTicket(ticket_code, userInfos?.userId, receiver_id)
              await admin.submitMessageToTicket(ticket_code, userInfos?.userId, text).then(() => {
                return res.status(201).json({success: `Message bien envoyé.`, tickets_infos: hoho})
              })
            } else {
                return res.status(200).json({error: "Captcha Invalide !"})
            }
          } catch (e) {
            return res.status(200).json({
              error: 'Un Problème est survenu.'
            })
          }
    },
    getAllMessagesOfTicket: async (req, res) => {
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
    deleteTicket: async (req, res) => {
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
        const tickets = await admin.deleteTicket(ticket_id)
        if(!tickets) {
          return res.status(200).json({error: 'Veuillez vérifier le code de votre ticket.'})
        }
        return res.status(201).json({success: "Ticket supprimé avec succès.", ticket_id: tickets?.id})
      } catch (e) {
        return res.status(200).json({
          error: 'Un Problème est survenu.'
        })
      }
    },
};
module.exports = adminController;