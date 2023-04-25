const emailValidator = require('email-validator');
var jwtUtils = require('../utils/jwt');
const fetch = require('node-fetch');
var jwt = require('jsonwebtoken');
require('dotenv').config();
const bcrypt = require('bcrypt');
const admin = require('../dataMappers/admin');
const users = require('../dataMappers/users');
const nodemailer = require('nodemailer');
const onlyLettersNumbersPattern = /^[A-Za-z0-9]+$/;
const LettersAndSpace = /^([a-zA-Z]+\s)*[a-zA-Z]+$/;
const Space = /\x20/g;
const userController = {
  signupAction: async (req, res) => {
    const {
      email,
      username,
      password,
      firstname,
      passwordconfirm,
      lastname,
      recaptcha
    } = req.body;
    try {
      if (!email) return res.status(200).json({
        error: 'Veuillez renseigner un mail'
      })
      if (!username) return res.status(200).json({
        error: 'Veuillez renseigner un pseudo'
      })
      if (!password) return res.status(200).json({
        error: 'Veuillez renseigner un mot de passe'
      })
      if (!firstname) return res.status(200).json({
        error: 'Veuillez renseigner un prénom'
      })
      if (!lastname) return res.status(200).json({
        error: 'Veuillez renseigner un Nom de famille'
      })
      if (!firstname.match(LettersAndSpace)) return res.status(200).json({
        error: 'Veuillez vérifier le prénom saisis.'
      })
      if (!lastname.match(LettersAndSpace)) return res.status(200).json({
        error: 'Veuillez vérifier le Nom de famille saisis.'
      })
      const emailtofind = email.toLowerCase();
      if (!emailValidator.validate(emailtofind)) return res.status(200).json({
        error: 'Vérifiez le mail saisis.'
      });
      if (!username.match(onlyLettersNumbersPattern)) return res.status(200).json({
        error: 'Vérifiez le pseudo saisis.'
      })
      if (password.match(Space)) return res.status(200).json({
        error: 'Veuillez vérifier votre mot de passe.'
      })
      if (username.length > 20) return res.status(200).json({
        error: 'Veuillez Saisir un pseudo de moins de 20 caractères.'
      })

      const user = await users.findByEmail(emailtofind.toLowerCase())
      if (user.length > 0) return res.status(200).json({error: 'L\'email à déjà été utilisé.'});
      if (user.length === 0) {
        const userName = await users.findByUsername(username.toLowerCase());
        if (userName.length != 0) return res.status(200).json({error: 'Ce pseudo à déjà été utilisé.'});
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
          if (userName.length === 0) {
            if (password === passwordconfirm) {
              const salt = await bcrypt.genSalt(10);
              const encryptedPassword = await bcrypt.hash(password, salt);
              const avatar_id = Math.floor(Math.random() * (25 - 1) + 1)
              const forLink = await users.createUser(username, firstname, lastname, email, encryptedPassword, avatar_id)
              await users.linkUserAndAvatar(parseInt(forLink[0].id), avatar_id)
              return res.status(201).json({
                success: `Compte crée avec succès.`
              });
            } else {
              return res.status(200).json({error : 'Vérifiez vos mot de passe.'})
            }
          }
       } return res.status(200).json({
        error: 'Captcha Invalide.'
      })
      }
    } catch (e) {
      return res.status(200).json({
        error: 'Un Problème est survenu.'
      })
    }

  },
  forgotPasswordRequest: async (req, res) => {
    const {
      email,
      recaptcha
    } = req.body;
    try {
      if (!email) return res.status(200).json({
        error: 'Veuillez renseigner un mail.'
        })
      if (!emailValidator.validate(email)) return res.status(200).json({
        error: 'Vérifiez le mail saisis.'
      });
      let recaptcha_success;
        await fetch(
          `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptcha}`, { method: 'POST'}
          ).then(res => res.json()).then(res => {
            if(res.success) {
              recaptcha_success = true;
              return res ;
            }
          });
          if(!recaptcha_success) {
            return res.status(200).json({error: 'Captcha Invalide.'})
            } else {
            const user = await users.findByEmail(email.toLowerCase())
            if (user.length > 0) {
              async function recoveryCodeGen() {
                let recoveryCode = require('crypto').randomBytes(32).toString('hex')
                let verify = await users.verifyRecoveryCode(recoveryCode.toLowerCase()).then((res) => res)
                if(verify) {
                  return recoveryCodeGen();
                }
                return recoveryCode ;
              }
              let recoveryCode ;
              await recoveryCodeGen().then((e) => recoveryCode = e);
              await users.addRecoveryCodeToUser(recoveryCode, email.toLowerCase())

              async function main() {
                let transporter = nodemailer.createTransport({
                  host: process.env.SMTP_HOST,
                  port: process.env.SMTP_PORT,
                  secure: false,
                  auth: {
                    user: process.env.SMTP_MAIL,
                    pass: process.env.SMTP_PASS,
                  },
                });
                let info = await transporter.sendMail({
                  from: `"KoalaBestBet" <${process.env.SMTP_MAIL}>`,
                  to: email,
                  subject: "KoalaBestBet - Mot de passe Oublié ?",
                  html: `
                  <b>Bonjour !</b>
                  <br /> Il semblerait que vous ayez oublié votre mot de passe, 
                  <br /> Si c'est le cas rendez-vous sur le lien suivant : 
                  <br />https://koalabestbet.me/auth/reset-password/${recoveryCode}`, // html body
                });
              }
              
              main().catch(console.error);
              return res.status(201).json({success: 'Si votre e-mail est bien présent dans notre base de donnée, vous recevrez un lien par mail afin de réinitialiser votre mot de passe. Pensez à vérifier vos spam.'});
            }
          else  {
        return res.status(201).json({success: 'Si votre e-mail est bien présent dans notre base de donnée, vous recevrez un lien par mail afin de réinitialiser votre mot de passe. Pensez à vérifier vos spam.'});
          }
        }
       } catch (e) {
      return res.status(200).json({
        error: 'Un Problème est survenu.'
      })
    }

  },
  checkRecoveryCode: async(req, res) => {
    const {
      recoveryCode
    } = req.params ;
    try {
      if(!recoveryCode || recoveryCode.length !== 64 || typeof recoveryCode !== 'string') return res.status(200).json({error: 'Veuillez vérifier votre code de récupération.'})
      const check = await users.verifyRecoveryCode(recoveryCode.toLowerCase()).then((res) => res)
      if(!check) {
        return res.status(200).json({error: 'Code récupération invalide ou expiré.'})
      }
    } catch(e) {
      return res.status(200).json({error: 'Un problème est survenu.'})
    }
  },
  forgotPasswordAction: async (req, res) => {
    const {
      newpassword,
      newpasswordconfirm,
      recaptcha
    } = req.body;
    const {
      recoveryCode
    } = req.params ;
    try {
      if (!recoveryCode) return res.status(200).json({
        error: 'Veuillez renseigner votre code de récupération.'
      })
      if (newpasswordconfirm !== newpassword || !newpasswordconfirm || !newpassword) return res.status(200).json({
        error: 'Veuillez vérifier les mot de passes renseignés.'
      })
      if (newpasswordconfirm?.length <= 6) return res.status(200).json({
        error: 'Votre mot de passe doit faire plus de 6 caractères'
      })
      if (newpassword.match(Space) || newpasswordconfirm.match(Space)) return res.status(200).json({
        error: 'Veuillez vérifier votre mot de passe.'
      })
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
              const salt = await bcrypt.genSalt(10);
              const encryptedPassword = await bcrypt.hash(newpassword, salt);
              await users.updatePasswordFromForgot(recoveryCode, encryptedPassword)
              await users.deleteRecoveryCode(recoveryCode)
              return res.status(201).json({
                success: `Mot de passe changé aves succès.`
              });
       } return res.status(200).json({
        error: 'Captcha Invalide.'
      })
    } catch (e) {
      return res.status(200).json({
        error: 'Un Problème est survenu.'
      })
    }

  },
  loginAction: async (req, res) => {
    const {
      email,
      password,
      recaptcha
    } = req.body;
    if (!email) return res.status(200).json({
      error: 'Vérifiez votre mail'
    })
    if (!password) return res.status(200).json({
      error: 'Vérifiez votre mot de passe'
    })
    if (!emailValidator.validate(email)) {
      return res.status(200).json({
        error: 'Vérifiez votre mail'
      });
    } else {
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
          const emailtofind = await users.findByEmail(email.toLowerCase());
          if (emailtofind.length != 0) {
            const verifyPassword = await bcrypt.compare(password, emailtofind[0].password).then((res) => res).catch((e) => console.error(e))
            if (verifyPassword) {  
              const id = emailtofind[0].id
              const allInfos = await users.findAllInfosOfUser(id).then(res => res)
              const refresh = jwtUtils.generateRefreshTokenForUser(emailtofind[0])  
              const token = jwtUtils.generateTokenForUser(emailtofind[0]) 
              await users.addRefreshTokenToUser(id, refresh).then(() => {
                res.cookie('jwt', refresh, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 24 * 60 * 60 * 1000 });
                return res.status(201).json({
                  username: allInfos[0].username,
                  avatar_path: allInfos[0].avatar_path.substring(15),
                  color: allInfos[0].color,
                  isLeading: allInfos[0].isLeading,
                  token,
                  isadmin: allInfos[0].isadmin
                })
              })
              } else {
                return res.status(200).json({
                  error: 'Vérifiez votre mail et mot de passe.'
                })
              }
          } else {
            return res.status(200).json({
              error: 'Vérifiez votre mail et mot de passe.'
            })
          }
        } 
        else {
          return res.status(200).json({
            error: 'Captcha Invalide.'
          })
      }
      } catch (e) {
        return res.status(200).json({
          error: 'Un Problème est survenu.'
        })
    }
    }
  },
  refreshToken: async (req, res) => {
    const cookies = req.cookies;
    try {
      if (!cookies?.jwt) {
        return res.status(401).json({
        error: "Token Manquant !"
      })
    }
    const refreshToken = cookies.jwt;
    const foundUser = await users.findByRefreshTokenUser(refreshToken);
    if (!foundUser) {
      return res.status(403).json({
        error: 'Token Invalide !'
      }) 
    } 
   async function genToken(infos) {
      return jwtUtils.generateTokenForUser(infos);
    }
    let jwtstatus = false;
    jwt.verify(refreshToken,process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
      if (err || foundUser.id !== decoded.userId) {
        return res.status(403).json({error: "Token Invalide !"})
      } else {
        return jwtstatus = true
        }
       }
      )
    if(jwtstatus) {
     const newToken = await genToken(foundUser)
     return res.status(201).json({token: newToken, username: foundUser?.username, isLeading: foundUser.isLeading, avatar_path: foundUser.avatar_path.substring(15), color: foundUser.color, isadmin: foundUser.isadmin})    
      }
    }catch(e) {
      return res.status(200).json({error: "Un Problème est survenu."});
      };
  },
  logoutAction: async (req, res) => {
    const cookies = req.cookies;
    try {
    if (!cookies?.jwt) return res.sendStatus(204)
    const refreshToken = cookies.jwt;

    const foundUser = await users.findByRefreshTokenUser(refreshToken);
    if (!foundUser) {
        res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
        return res.sendStatus(204);
    }

    await users.deleteRefreshTokenOfUser(foundUser.id);

    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
    res.sendStatus(204);
  } catch(e) {
    return res.status(200).json({error: 'Un problème est survenu.'}) 
  }
  },
  findUserById: async (req, res) => {
    try {
      console.log(req.cookies)
      const userInfos = jwt.decode(req.cookies.jwt, process.env.JWT_REFRESH_SECRET, (err, user) => {
        if (err) return res.status(403).send({
          error: 'Token Invalide !'
        })
        return user;
      })
        const usertofind = await users.findByIdUser(userInfos?.userId).then((res) => res).catch((e) => console.error(e));
        if (usertofind?.id) {
          return res.status(201).json({
            username: usertofind?.username,
            email: usertofind?.email,
            firstname: usertofind?.firstname,
            lastname: usertofind?.lastname,
            koalacoin: usertofind?.koalacoin,
            grade: usertofind?.grade,
            avatar_path: usertofind?.avatar_path.substring(15),
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
  findUserByUsername: async (req, res) => {
    try {
      const {
        username
      } = req.body
      const userInfos = jwt.decode(req.cookies.jwt, process.env.JWT_REFRESH_SECRET, (err, user) => {
        if (err) return res.status(403).send({
          error: 'Token Invalide !'
        })
        return user;
      })
      if(!username) return res.status(200).json({error: 'Veuillez renseigner un username.'})
        const usertofind = await users.findByUsernameUser(username).then((res) => res).catch((e) => console.error(e));
        if (usertofind?.id) {
          return res.status(201).json({
            username: usertofind?.username,
            koalacoin: usertofind?.koalacoin,
            grade: usertofind?.grade,
            memberSince: usertofind?.to_char,
            avatar_path: usertofind?.avatar_path.substring(15),
          });
        }
      return res.status(200).json({
        error: 'Veuillez vérifier l\' username.'
      });
    } catch (e) {
      return res.status(200).json({
        error: 'Un Problème est survenu.'
      })
    }
  },
  // updateInfosByUserId: async (req, res) => {
  //   const {
  //     id
  //   } = req.params;
  //   const {
  //     username,
  //     firstname,
  //     lastname,
  //     email,
  //     password,
  //   } = req.body;
  //   const userN = username.toLowerCase();
  //   const emailE = email.toLowerCase();
  //   const firstN = firstname.toLowerCase();
  //   const lastN = lastname.toLowerCase();
  //   try {
  //     if (!id || isNaN(id)) return res.status(200).json({
  //       error: 'Veuillez vérifier l\' ID fournis.'
  //     })
  //     if (req.user.userId == id) {
  //       if (email && username && firstname && lastname && password) {
  //         if (lastname.length > 40) return res.status(200).json({
  //           error: 'Veuillez Saisir un Nom de Famille de moins de 40 Caractères'
  //         })
  //         if (firstname.length > 20) return res.status(200).json({
  //           error: 'Veuillez Saisir un Prénom de moins de 20 Caractères'
  //         })
  //         if (!username.match(onlyLettersNumbersPattern)) return res.status(200).json({
  //           error: 'Veuillez vérifier le nom d\'utilisateur saisis.'
  //         })
  //         if (!emailValidator.validate(email)) return res.status(200).json({
  //           error: 'Veuillez saisir un mail valide.'
  //         });
  //         if (username.length > 20) return res.status(200).json({
  //           error: 'Veuillez Saisir un pseudo de moins de 20 Caractères'
  //         })
  //         const usertofind = await users.findAllInfosOfUser(id)
  //         const userDB = usertofind[0].username.toLowerCase();
  //         const emailDB = usertofind[0].email.toLowerCase();
  //         const firstnameDB = usertofind[0].firstname.toLowerCase();
  //         const lastnameDB = usertofind[0].lastname.toLowerCase();
  //         if (!firstname.match(LettersAndSpace)) return res.status(200).json({
  //           error: 'Veuillez vérifier le prénom saisis.'
  //         })
  //         if (!lastname.match(LettersAndSpace)) return res.status(200).json({
  //           error: 'Veuillez vérifier le Nom de famille saisis.'
  //         })
  //         if (usertofind.length != 0) {
  //           const verifyPassword = await bcrypt.compare(password, usertofind[0].password).then((res) => res).catch((e) => console.error(e))
  //           if (!verifyPassword) return res.status(200).json({
  //             error: 'Veuillez vérifier votre mot de passe.'
  //           })
  //           if (verifyPassword) {
  //             if (userN === userDB && emailE === emailDB && firstnameDB === firstN && lastnameDB === lastN) return res.status(200).json({
  //               error: 'Aucun changement détecté'
  //             });
  //             if (userN !== userDB && emailE !== emailDB) {
  //               const user = await users.findByEmail(emailE)
  //               if (user.length > 0) return res.status(200).json({
  //                 error: 'L\'email à déjà été utilisé'
  //               });
  //               const userName = await users.findByUsername(userN);
  //               if (userName.length != 0) return res.status(200).json({
  //                 error: 'Ce pseudo à déjà été utilisé'
  //               });
  //               let newArray = [];
  //               newArray.push({
  //                 email: req.body.email,
  //                 username: req.body.username,
  //                 firstname: req.body.firstname,
  //                 lastname: req.body.lastname
  //               })
  //               await users.updateUser(id, newArray[0]).catch((e) => {
  //                 return res.status(200).json({
  //                   error: 'Un Problème est survenu.'
  //                 })
  //               })
  //               return res.status(201).json({
  //                 success: 'Informations Utilisateur mise à jour.'
  //               })
  //             }
  //             if (userN !== userDB) {
  //               const userName = await users.findByUsername(userN);
  //               if (userName.length != 0) return res.status(200).json({
  //                 error: 'Ce pseudo à déjà été utilisé'
  //               });
  //               let newArray = [];
  //               newArray.push({
  //                 username: req.body.username,
  //                 firstname: req.body.firstname,
  //                 lastname: req.body.lastname
  //               })
  //               await users.updateUser(id, newArray[0]).catch((e) => {
  //                 return res.status(200).json({
  //                   error: 'Un Problème est survenu.'
  //                 })
  //               })
  //               return res.status(201).json({
  //                 success: 'Informations Utilisateur mise à jour.'
  //               })
  //             }
  //             if (emailE !== emailDB) {
  //               const user = await users.findByEmail(emailE)
  //               if (user.length > 0) return res.status(200).json({
  //                 error: 'L\'email à déjà été utilisé'
  //               });
  //               let newArray = [];
  //               newArray.push({
  //                 email: req.body.email,
  //                 firstname: req.body.firstname,
  //                 lastname: req.body.lastname
  //               })
  //               await users.updateUser(id, newArray[0]).catch((e) => {
  //                 if (e) return res.status(500)
  //               })
  //               return res.status(201).json({
  //                 success: 'Informations Utilisateur mise à jour.'
  //               })
  //             }
  //             let newArray = [];
  //             newArray.push({
  //               firstname: req.body.firstname,
  //               lastname: req.body.lastname
  //             })
  //             await users.updateUser(id, newArray[0]).catch((e) => {
  //               return res.status(200).json({
  //                 error: 'Un Problème est survenu.'
  //               })
  //             })
  //             return res.status(201).json({
  //               success: 'Informations Utilisateur mise à jour.'
  //             })
  //           }
  //           return res.status(200).json({
  //             error: 'Veuillez vérifier vos mot de passe.'
  //           })
  //         }
  //       }
  //       return res.status(200).json({
  //         error: 'Veuillez saisir les infos à modifier.'
  //       });

  //     }
  //     return res.status(200).json({
  //       error: 'Veuillez vérifier l\' ID fournis.'
  //     });
  //   } catch (e) {
  //     return res.status(200).json({
  //       error: 'Un Problème est survenu.'
  //     })
  //   }
  // },
//   updatePasswordByUserId: async (req, res) => {
//     const {
//       id
//     } = req.params;
//     const {
//       password,
//       newPassword,
//       confirmNewPassword
//     } = req.body;
//     try {
//        if (!id || isNaN(id)) return res.status(200).json({
//           error: 'Veuillez vérifier l\' ID fournis.'
//         })
//         if(!password || !newPassword || !confirmNewPassword) return 
//       if (req.user.userId == id) {
//         const usertofind = await users.findAllInfosOfUser(id)
//         const verifyPassword = await bcrypt.compare(password, usertofind[0].password).then((res) => res).catch((e) => console.error(e))
//             if (!verifyPassword) return res.status(200).json({
//               error: 'Veuillez vérifier votre mot de passe.'
//             })
//             if(newPassword !== confirmNewPassword) return res.status(200).json({
//               error: 'Le nouveau mot de passe et sa confirmation ne correspondent pas.'
//             })
//             if(newPassword === password) return res.status(200).json({
//               error: 'Le nouveau mot de passe doit être différent de l\'ancien.'
//             })
//             if(verifyPassword) {
//               const salt = await bcrypt.genSalt(10);
//               const encryptedPassword = await bcrypt.hash(newPassword, salt);
//              await users.updatePassword(id, encryptedPassword).catch((e) => {
//               return res.status(200).json({
//                 error: 'Un Problème est survenu.'
//              })
//             })
//             return res.status(201).json({
//               success: 'Le Mot de passe a bien été changé.'
//            })

//     } 
//     return res.status(200).json({
//       error : 'Veuillez vérifier l\' ID fournis.'
//     })
//   } 
// }catch (e) {
//       return res.status(200).json({
//         error: 'Un Problème est survenu.'
//       })
//     }
//   },
updatePasswordByUserId: async (req, res) => {
  const {
    password, passwordconfirm
  } = req.body;
  try {
      if(!password || !passwordconfirm) return res.status(200).json({
        error: 'Veuillez renseigner un nouveau mot de passe et sa confirmation.'
      })
      const userInfos = jwt.decode(req.cookies.jwt, process.env.JWT_REFRESH_SECRET, (err, user) => {
        if (err) return res.status(403).send({
          error: 'Token Invalide !'
        })
        return user;
        })
          if(password !== passwordconfirm) return res.status(200).json({
            error: 'Le nouveau mot de passe et sa confirmation ne correspondent pas.'
          })
            const salt = await bcrypt.genSalt(10);
            const encryptedPassword = await bcrypt.hash(passwordconfirm, salt);
           await users.updatePassword(userInfos.userId, encryptedPassword).catch((e) => {
            return res.status(200).json({
              error: 'Un Problème est survenu.'
           })
          })
          return res.status(201).json({
            success: 'Le Mot de passe a bien été changé.'
         })
}catch (e) {
    return res.status(200).json({
      error: 'Un Problème est survenu.'
    })
  }
},
  updateUsernameByUserId: async (req, res) => {
    const {
      username
    } = req.body;
    try {
        if (!username.match(onlyLettersNumbersPattern)) return res.status(200).json({
          error: 'Veuillez vérifier le nom d\'utilisateur saisis.'
        })
        const userInfos = jwt.decode(req.cookies.jwt, process.env.JWT_REFRESH_SECRET, (err, user) => {
          if (err) return res.status(403).send({
            error: 'Token Invalide !'
          })
          return user;
        })
        const usertofind = await users.findAllInfosOfUser(userInfos.userId)
        if (username.toLowerCase() !== usertofind[0].username.toLowerCase()) {
          const userName = await users.findByUsername(username);
          if (userName.length != 0) return res.status(200).json({
            error: 'Ce pseudo à déjà été utilisé'
          });
          let newArray = [];
          newArray.push({
            username: req.body.username
          })
          await users.updateUser(userInfos.userId, newArray[0]).catch((e) => {
            return res.status(200).json({
              error: 'Un Problème est survenu.'
            })
          })
          return res.status(201).json({
            success: 'Pseudo mis à jour.'
          })
        }
        return res.status(200).json({
          error : 'Le Pseudo saisis doit être différent de celui que vous utilisez déjà.'
        })
    }catch (e) {
      return res.status(200).json({
        error: 'Un Problème est survenu.'
      })
    }
  },
  updateFirstnameByUserId: async (req, res) => {
    const {
      firstname
    } = req.body;
    try {
        if (!firstname.match(LettersAndSpace)) return res.status(200).json({
          error: 'Veuillez vérifier le prénom saisis.'
        })
        const userInfos = jwt.decode(req.cookies.jwt, process.env.JWT_REFRESH_SECRET, (err, user) => {
          if (err) return res.status(403).send({
            error: 'Token Invalide !'
          })
          return user;
        })
          let newArray = [];
          newArray.push({
            firstname: req.body.firstname
          })
          await users.updateUser(userInfos.userId, newArray[0]).catch((e) => {
            return res.status(200).json({
              error: 'Un Problème est survenu.'
            })
          })
          return res.status(201).json({
            success: 'Prénom mis à jour.'
          })
    }catch (e) {
      return res.status(200).json({
        error: 'Un Problème est survenu.'
      })
    }
  },
  updateLastnameByUserId: async (req, res) => {
    const {
      lastname
    } = req.body;
    try {
        if (!lastname.match(LettersAndSpace)) return res.status(200).json({
          error: 'Veuillez vérifier le prénom saisis.'
        })
        const userInfos = jwt.decode(req.cookies.jwt, process.env.JWT_REFRESH_SECRET, (err, user) => {
          if (err) return res.status(403).send({
            error: 'Token Invalide !'
          })
          return user;
        })
          let newArray = [];
          newArray.push({
            lastname: req.body.lastname
          })
          await users.updateUser(userInfos.userId, newArray[0]).catch((e) => {
            return res.status(200).json({
              error: 'Un Problème est survenu.'
            })
          })
          return res.status(201).json({
            success: 'Prénom mis à jour.'
          })
    }catch (e) {
      return res.status(200).json({
        error: 'Un Problème est survenu.'
      })
    }
  },
  updateEmailByUserId: async (req, res) => {
    const {
      email
    } = req.body;
    try {
        if (!emailValidator.validate(email)) return res.status(200).json({
          error: 'Veuillez saisir un mail valide.'
        });
        const userInfos = jwt.decode(req.cookies.jwt, process.env.JWT_REFRESH_SECRET, (err, user) => {
          if (err) return res.status(403).send({
            error: 'Token Invalide !'
          })
          return user;
        })

        const usertofind = await users.findAllInfosOfUser(userInfos.userId)
        if (email.toLowerCase() !== usertofind[0].email.toLowerCase()) {
          const user = await users.findByEmail(email.toLowerCase())
          if (user.length > 0) return res.status(200).json({
            error: 'L\'email à déjà été utilisé'
          });
          let newArray = [];
          newArray.push({
            email
          })
          await users.updateUser(userInfos.userId, newArray[0]).catch((e) => {
            if (e) return res.status(500)
          })
          return res.status(201).json({
            success: 'E-Mail mis à jour.'
          })
        }
        return res.status(200).json({
          error : 'Le Mail saisis doit être différent de celui que vous utilisez déjà.'
        })
    }catch (e) {
      return res.status(200).json({
        error: 'Un Problème est survenu.'
      })
    }
  },
  updateAvatarByUserId: async (req, res) => {
    try {
        //Je recupère le nombre d'avatar présent dans la base de donnée
        const numberOfAvatar = await users.getNumberOfAvatar();
        let avatarID
        const userInfos = jwt.decode(req.cookies.jwt, process.env.JWT_REFRESH_SECRET, (err, user) => {
          if (err) return res.status(403).send({
            error: 'Token Invalide !'
          })
          return user;
        })
        async function changeAvatar() {
          //Je génère mon ID d'avatar
          let avatar_id = Math.floor(Math.random() * (numberOfAvatar.count - 1) + 1)
          avatarID = avatar_id
          //Je vérifie coté base de donnée que l'ID généré ne correspond a l'id de l'avatar déjà présent
          let verify = await users.checkIfUserGotAvatar(userInfos.userId, parseInt(avatar_id))
          if(verify.length > 0) {
            //Si c'est le cas je rappel ma fonction pour en générer un autre ID d'avatar
            return changeAvatar()
          }
            //Le cas écheant je return tout simplement ma fonction pour update l'avatar coté base de donnée
          return await users.updateAvatarOfUser(userInfos.userId, parseInt(avatar_id))
        }
              await changeAvatar();
              const path = await users.getPathOfAvatar(avatarID)
              return res.status(201).json({
                success: 'Avatar mis à jour.',
                new_path: path.avatar_path.substring(15)
              })
    }catch (e) {
      return res.status(200).json({
        error: 'Un Problème est survenu.'
      })
    }
  },
  deleteUser: async (req, res) => {
    try {
      const userInfos = jwt.decode(req.cookies.jwt, process.env.JWT_REFRESH_SECRET, (err, user) => {
        if (err) return res.status(403).send({
          error: 'Token Invalide !'
        })
        return user;
      })
        const usertofind = await users.findByIdUser(userInfos.userId).then((res) => res).catch((e) => console.error(e));
        if (usertofind.length != 0) {
          await users.deleteUser(userInfos.userId).catch((e) => {
            return res.status(200).json({
              error: 'Un Problème est survenu.'
            })
          })
          res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
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
  getRank: async (_, res) => {
    try {
      const result = await users.getRank()
      return res.status(201).json(result)
    } catch (e) {
      return res.status(200).json({
        error: 'Un Problème est survenu.'
      })
    }
  },
  getRankLimited: async (_, res) => {
    try {
      const result = await users.getRankLimited()
      return res.status(201).json(result)
    } catch (e) {
      return res.status(200).json({
        error: 'Un Problème est survenu.'
      })
    }
  },
  listTickets: async (req, res) => {
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
      const tickets = await users.listTicketsByUserId(userInfos.userId)
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
  createTicketUser: async (req, res) => {
    const { subject, text, recaptcha } = req?.body?.data
    if(!req?.cookies?.jwt) {
        return res.status(200).json({error: 'Token Manquant !'})
      }
      const userInfos = jwt.decode(req.cookies.jwt, process.env.JWT_REFRESH_SECRET, (err, user) => {
        if (err) return res.status(403).send({
          error: 'Token Invalide !'
        })
        return user;
      })
      if(!subject || !text || !recaptcha) {
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
          await admin.addParticipantToTicket(ticket_code, userInfos?.userId, 1)
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
};
module.exports = userController;