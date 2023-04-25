require('dotenv').config();
const groups = require('../dataMappers/group')
const bets = require('../dataMappers/bets');
const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');
const options = {
  method: 'GET',
  headers: {
    Accept: 'application/json',
    Authorization: `Bearer ${process.env.PANDA_KEY}`
  }
};
async function updatewinningBet(id) {
  await bets.updateBetStatusWinner(id).then((e) => e).catch((e) => {
  }) 
}
async function updatelosingBet(id) {
  await bets.updateBetStatusLoser(id).then((e) => e).catch((e) => {
  })
}
async function updatecanceledBet(id) {
  await bets.updateBetStatusCanceled(id).then((e) => e).catch((e) => {
  })
}
async function updatepostponedBet(id) {
  await bets.updateBetStatusPostponed(id).then((e) => e).catch((e) => {
  })
}
async function createBet(hoho, userId, group_id, e) {
  await bets.createBet(hoho, userId, group_id, e).then((e) => e).catch((e) => {
  })
}
const betController = {
  //Permet a l'utilisateur d'envoyer ses pronostics au groupe correspondant
  submitBet: async (req, res) => {
    const group_id = parseInt(req.params.group_id)
    try {
      //Je vérifie que le group_id fournis est bien un Number grace au parseInt juste au dessus.
      if (!group_id) return res.status(200).json({
        error: 'Veuillez renseigner l\'ID du groupe'
      })
      // Je vérifie que les paris sont bien fournis.
      if (typeof req.body.bets === 'undefined' || !req.body.bets.length || !req.body.bets) return res.status(200).json({
        error: 'Veuillez renseigner les Matchs'
      })
      // Je vérifie que les paris fournis sont bien des Number.
      if (!req.body.bets.every(type => typeof type.selected === "number")) return res.status(200).json({
        error: 'Veuillez vérifier les pronostics renseignés'
      })
      // Je vérifie que le groupe fournis dans le group_id existe bien.
      const groupInfos = await groups.getInfosFromGroup(group_id).then((res) => res).catch((e) => console.error(e))
      if (typeof groupInfos[0] === 'undefined') return res.status(200).json({
        error: 'Veuillez vérifier l\'ID du groupe renseigné'
      })
      //Je vérifie que l'user est bien présent dans le groupe.
      const userInfos = jwt.decode(req.cookies.jwt, process.env.JWT_REFRESH_SECRET, (err, user) => {
        if (err) return res.status(403).send({
          error: 'Token Invalide !'
        })
        return user;
      })
      const verifyUser = groupInfos.filter(element => element.id === userInfos?.userId)
      if (!verifyUser.length) return res.status(200).json({
        error: 'Vous ne pouvez pas parier dans ce groupe !'
      })
      //Je vérifie que le nombre de bet fournis correspond bien au nombre de match.
      const verifyLenghtOfBet = await groups.getMatchOfGroup(group_id, userInfos?.userId).then((res) => res).catch((e) => console.error(e))
      if (verifyLenghtOfBet.length !== req.body.bets.length) return res.status(200).json({
        error: 'Vérifiez votre nombre de paris !'
      })
      //Je vérifie dans un premier temps si l'user n'a pas encore parié dans le groupe.
      //Si tout est bon, j'envoie les paris en base de donnée.
      const verifyIfAllreadyBet = await bets.getBetsByGroupAndUser(group_id, userInfos?.userId)
      if (!verifyIfAllreadyBet[0]) {
        const hoho = Object.keys(req.body.bets).sort((a , b) => b - a)
        for(let i = 0; i < hoho.length;) {
          createBet(req.body.bets[hoho[i]].selected, userInfos?.userId, group_id, req.body.bets[hoho[i]].id)
          i++;
        }
        
        await bets.updateParticipe(userInfos?.userId, group_id)
        return res.status(201).json({
          success: 'Vos pronostics ont été enregistré !'
        })
      }

      return res.status(200).json({
        error: 'Vous avez déja parié dans ce groupe !'
      })
    } catch (e) {
      return res.status(200).json({
        error: 'Un Problème est survenu.'
      })
    }
  },
  //Permet de vérifier tout les bets d'un groupe
  verifyBetByGroup: async (req, res) => {
    const group_id = parseInt(req.params.group_id)
    try {
      if (!group_id) return res.status(200).json({
        error: 'Veuillez renseigner l\'ID du groupe'
      })
      const groupInfos = await groups.getInfosFromGroup(group_id).then((res) => res).catch((e) => console.error(e))
      if (typeof groupInfos[0] === 'undefined') return res.status(200).json({
        error: 'Veuillez vérifier l\'ID du groupe renseigné'
      })
      const userInfos = jwt.decode(req.cookies.jwt, process.env.JWT_REFRESH_SECRET, (err, user) => {
        if (err) return res.status(403).send({
          error: 'Token Invalide !'
        })
        return user;
      })
      const verifyUser = groupInfos.find(element => element.id === userInfos.userId)
      if (!verifyUser) return res.status(200).json({
        error: 'Vous n\'avez pas accès aux infos de ce groupe !'
      })

        const betUser = await bets.getBetsByGroup(group_id)
        const MatchesOfGroup = await groups.getMatchOfGroup(group_id, userInfos.userId)
        //Si tout les points ont déja été distribué je renvoie ce message
        if (betUser.every(ele => ele.status === 'pointsdistributed')) return res.status(200).json({
          error: 'Points déja distribué.'
        })
        //Si tout les paris ont déja été vérifié je renvoie ce message en 201 car côté front une condition est prévue
        //si le status est en 201 il nous est possible de passer a la prochaine fonction qui est -> updatePointsByGroup
        //cela nous évite ainsi de faire des filter inutile et gagner en performance
        if (betUser.every(ele => ele.status === 'finished')) return res.status(201).json({
          error: 'Paris déja vérifié.'
        })
      let matches = [];
      let betFromUser = [];
      for (a of MatchesOfGroup) {
        matches.push(a.match_pandascore)
      }
      const matchsid = matches.join(',')
      //Je récupère les infos des matchs d'un groupe via l'API Pandascore
      await fetch(`https://api.pandascore.co/matches?filter[id]=${matchsid}&sort=-id&page=1&per_page=100`, options)
        .then(response => {
          return response.json()
        })
        .then(response => {
            betFromUser.push(response.reverse())
        })
        .catch(err => console.error(err));
       const filtered =  betFromUser[0].filter((e) => e.status === 'finished' || e.status === 'postponed' || e.status === 'canceled')
       if (filtered.length !== matches.length)return res.status(200).json({
        error: 'Tous les matchs ne sont pas encore finis !'
      })
        if (filtered.length === matches.length){
          const getResults = await groups.getRankOfGroup(group_id).then((res) => res).catch((e) => console.error(e))
          const verifyIfAllUserBet = await groups.getAllInfosFromGroupByUserId(group_id, userInfos.userId).then((res) => res).catch((e) => console.error(e))
           //Ici je vérifie que tous les joueurs ont bien rejoins le groupe avant que tous les matchs ne soient finis.
            if (getResults.length !== verifyIfAllUserBet[0].nb_participants_max) {
              await groups.updateStatusGroup(group_id, 'expired')
              return res.status(200).json({
              error: 'Tous les joueurs n\'ont pas parié à temps ! Veuillez re-créer un groupe, aucun KoalaCoins ne sera distribué.'
            })
          }
        for(var i = 0; i < betFromUser[0].length; i++) {
          betUser.filter((e) => {
            if(betFromUser[0][i].winner_id === e.bet && betFromUser[0][i].id === e.match_pandascore && betFromUser[0][i].status === 'finished' && e.status !== 'finished'){
              updatewinningBet(e.id).catch(er => console.log(er))
            }
          })
          betUser.filter((e) => {
            if(betFromUser[0][i].winner_id !== e.bet && betFromUser[0][i].id === e.match_pandascore && betFromUser[0][i].status === 'finished' && e.status !== 'finished'){
              updatelosingBet(e.id).catch(er => console.log(er))
            }
          })
          betUser.filter((e) => {
            if(betFromUser[0][i].status === 'canceled' && betFromUser[0][i].id === e.match_pandascore && e.status !== 'canceled'){
              updatecanceledBet(e.match_id).catch(er => console.log(er))
            }
          })
          betUser.filter((e) => {
            if(betFromUser[0][i].status === 'postponed' && betFromUser[0][i].id === e.match_pandascore && e.status !== 'canceled'){
              updatepostponedBet(e.match_id).catch(er => console.log(er))
            }
          })
          }
        return res.status(201).json({
          success: 'Paris vérifié.'
        })
      }
    } catch (e) {
      console.log(e)
      return res.status(200).json({
        error: 'Un Problème est survenu.'
      })
    }
  },
  updatePointsByGroup: async (req, res) => {
    const group_id = parseInt(req.params.group_id)
    try {
      if (isNaN(group_id)) return res.status(200).json({
        error: 'Veuillez renseigner l\'ID du groupe'
      })
      const groupInfos = await groups.getInfosFromGroup(group_id).then((res) => res).catch((e) => console.error(e))
      if (typeof groupInfos[0] === 'undefined') return res.status(200).json({
        error: 'Veuillez vérifier l\'ID du groupe renseigné'
      })
      const userInfos = jwt.decode(req.cookies.jwt, process.env.JWT_REFRESH_SECRET, (err, user) => {
        if (err) return res.status(403).send({
          error: 'Token Invalide !'
        })
        return user;
      })
      const verifyUser = groupInfos.find(element => element.user_id === userInfos.userId)
      if (!verifyUser) return res.status(200).json({
        error: 'Vous n\'avez pas accès aux infos de ce groupe !'
      })
      const getResults = await groups.getRankOfGroup(group_id).then((res) => res).catch((e) => console.error(e))
      const verifyIfAllUserBet = await groups.getAllInfosFromGroupByUserId(group_id, userInfos.userId).then((res) => res).catch((e) => console.error(e))
      if (getResults.length !== verifyIfAllUserBet[0].nb_participants_max) return res.status(200).json({
        error: 'Tous les joueurs n\'ont pas encore parié ! Si un ou plusieurs matchs sont finis, veuillez re-créer un groupe, aucun KoalaCoins ne sera distribué'
      })
      if (getResults.length === verifyIfAllUserBet[0].nb_participants_max) {
        let matchesCanceled = [];
        let matchesFinished = [];
        let matchesPostponed = [];
        const betUser = await bets.getBetsByGroupAndUser(group_id, userInfos.userId)
        betUser.filter((element) => {
          if(element.status === 'canceled') {
            matchesCanceled.push(element)
          }
        })
        betUser.filter((element) => {
          if(element.status === 'postponed') {
            matchesPostponed.push(element)
          }
        })
        betUser.filter((element) => {
          if(element.status === 'finished') {
            matchesFinished.push(element)
          }
        })
        if(matchesCanceled.length === betUser.length) {
          await groups.updateStatusGroup(group_id, 'expired')
          return res.status(200).json({
          error: 'Tous les matchs ont été annulés, aucun points ne peut être distribué !'
        })
      }
      if(matchesPostponed.length === betUser.length) {
        await groups.updateStatusGroup(group_id, 'postponed')
        return res.status(200).json({
        error: 'Tous les matchs ont été reportés, aucun points ne peut être distribué !'
      })
    }
        if (betUser.every(el => el.status === 'pointsdistributed')) return res.status(200).json({
          error: 'Tous les points ont déjà été distribués !'
        })
        
        else
         if (matchesFinished.length + matchesCanceled.length + matchesPostponed.length === betUser.length) {
          const participantMultiple = Math.ceil(getResults[0].winning_bet * 10)
          const matchMultiple = Math.ceil(((betUser.length - matchesCanceled.length) - matchesPostponed.length) * 10)
          //Cette condition ci-dessous me permet de vérifier la taille du groupe et ainsi pouvoir 
          //répartir les points, elle se répète plusieurs fois, en vérfiant que le getResults.length est égale a un nombre entre 2 et 5.
          if (getResults.length === 2) {
            const KoalaPrize = participantMultiple + matchMultiple;
            if (getResults[0].winning_bet === '0' && getResults[1].winning_bet === '0') {
              const betUser1 = await bets.getBetsByGroupAndUser(group_id, getResults[0].id)
              const betUser2 = await bets.getBetsByGroupAndUser(group_id, getResults[1].id)
              //Je met à jour côté base de donnée le status des bet en 'pointsdistributed'.
              for (a of betUser1) {
                await bets.updateBetAfterGivenPoints(a.id)
              }
              for (b of betUser2) {
                await bets.updateBetAfterGivenPoints(b.id)
              }
              await groups.updateStatusGroup(group_id, 'finished')
              return res.status(201).json({
                success: 'Aucun Vainqueur, aucun KC distribué'
              })
            }
            //si égalité
            if (getResults[0].winning_bet === getResults[1].winning_bet) {
              const betUser1 = await bets.getBetsByGroupAndUser(group_id, getResults[0].id)
              const betUser2 = await bets.getBetsByGroupAndUser(group_id, getResults[1].id)
              //Je met à jour côté base de donnée le status des bet en 'pointsdistributed'.
              for (a of betUser1) {
                await bets.updateBetAfterGivenPoints(a.id)
              }
              for (b of betUser2) {
                await bets.updateBetAfterGivenPoints(b.id)
              }
              //Je répartis les KoalaCoins.
              await bets.addPointsToUser(getResults[0].id, KoalaPrize / 2)
              await bets.addPointsToHistory(getResults[0].id, group_id, KoalaPrize / 2)
              await bets.addPointsToUser(getResults[1].id, KoalaPrize / 2)
              await bets.addPointsToHistory(getResults[1].id, group_id, KoalaPrize / 2)
              await groups.updateStatusGroup(group_id, 'finished')
              return res.status(201).json({
                success: `Égalite ${KoalaPrize} partagé entre les deux participants`
              })
            }
            if (getResults[0].winning_bet > getResults[1].winning_bet) {
              const betUser1 = await bets.getBetsByGroupAndUser(group_id, getResults[0].id)
              const betUser2 = await bets.getBetsByGroupAndUser(group_id, getResults[1].id)
              for (a of betUser1) {
                await bets.updateBetAfterGivenPoints(a.id)
              }
              for (b of betUser2) {
                await bets.updateBetAfterGivenPoints(b.id)
              }
              await bets.addPointsToUser(getResults[0].id, KoalaPrize)
              await bets.addPointsToHistory(getResults[0].id, group_id, KoalaPrize)
              await bets.addPointsToHistory(getResults[1].id, group_id, 0)
              await groups.updateStatusGroup(group_id, 'finished')
              return res.status(201).json({
                success: `Bravo ! ${KoalaPrize} distribué à ${getResults[0].username}`
              })
            }
          }
          if (getResults.length === 3) {
            const KoalaPrize = participantMultiple + matchMultiple;
            if (getResults[0].winning_bet === '0' && getResults[1].winning_bet === '0' && getResults[2].winning_bet === '0') {
              const betUser1 = await bets.getBetsByGroupAndUser(group_id, getResults[0].id)
              const betUser2 = await bets.getBetsByGroupAndUser(group_id, getResults[1].id)
              const betUser3 = await bets.getBetsByGroupAndUser(group_id, getResults[2].id)
              for (a of betUser1) {
                await bets.updateBetAfterGivenPoints(a.id)
              }
              for (b of betUser2) {
                await bets.updateBetAfterGivenPoints(b.id)
              }
              for (c of betUser3) {
                await bets.updateBetAfterGivenPoints(c.id)
              }
              await groups.updateStatusGroup(group_id, 'finished')
              return res.status(201).json({
                success: 'Aucun Vainqueur, aucun KC distribué'
              })
            }
            if (getResults[0].winning_bet === getResults[1].winning_bet && getResults[1].winning_bet === getResults[2].winning_bet) {
              const betUser1 = await bets.getBetsByGroupAndUser(group_id, getResults[0].id)
              const betUser2 = await bets.getBetsByGroupAndUser(group_id, getResults[1].id)
              const betUser3 = await bets.getBetsByGroupAndUser(group_id, getResults[2].id)
              for (a of betUser1) {
                await bets.updateBetAfterGivenPoints(a.id)
              }
              for (b of betUser2) {
                await bets.updateBetAfterGivenPoints(b.id)
              }
              for (c of betUser3) {
                await bets.updateBetAfterGivenPoints(c.id)
              }
              const KoalaPrizeEqual = Math.ceil(KoalaPrize / getResults.length)
              await bets.addPointsToUser(getResults[0].id, KoalaPrizeEqual)
              await bets.addPointsToHistory(getResults[0].id, group_id, KoalaPrizeEqual)
              await bets.addPointsToUser(getResults[1].id, KoalaPrizeEqual)
              await bets.addPointsToHistory(getResults[1].id, group_id, KoalaPrizeEqual)
              await bets.addPointsToUser(getResults[2].id, KoalaPrizeEqual)
              await bets.addPointsToHistory(getResults[2].id, group_id, KoalaPrizeEqual)
              await groups.updateStatusGroup(group_id, 'finished')
              return res.status(201).json({
                success: `Égalite ${KoalaPrize} partagé entre les 3 participants`
              })
            }
            if (getResults[0].winning_bet > getResults[1].winning_bet && getResults[1].winning_bet === '0' && getResults[2].winning_bet === '0') {
              const betUser1 = await bets.getBetsByGroupAndUser(group_id, getResults[0].id)
              const betUser2 = await bets.getBetsByGroupAndUser(group_id, getResults[1].id)
              const betUser3 = await bets.getBetsByGroupAndUser(group_id, getResults[2].id)
              for (a of betUser1) {
                await bets.updateBetAfterGivenPoints(a.id)
              }
              for (b of betUser2) {
                await bets.updateBetAfterGivenPoints(b.id)
              }
              for (c of betUser3) {
                await bets.updateBetAfterGivenPoints(c.id)
              }
              await bets.addPointsToUser(getResults[0].id, KoalaPrize)
              await bets.addPointsToHistory(getResults[0].id, group_id, KoalaPrize)
              await bets.addPointsToUser(getResults[1].id, 0)
              await bets.addPointsToHistory(getResults[1].id, group_id, 0)
              await bets.addPointsToUser(getResults[2].id, 0)
              await bets.addPointsToHistory(getResults[2].id, group_id, 0)
              await groups.updateStatusGroup(group_id, 'finished')
              return res.status(201).json({
                success: `Bravo ! ${KoalaPrize} KoalaCoins distribué à ${getResults[0].username} et ${KoalaPrize2} distribué à ${getResults[1].username} et ${getResults[2].username}.`
              })
            }
            if (getResults[0].winning_bet > getResults[1].winning_bet && getResults[1].winning_bet === getResults[2].winning_bet) {
              const betUser1 = await bets.getBetsByGroupAndUser(group_id, getResults[0].id)
              const betUser2 = await bets.getBetsByGroupAndUser(group_id, getResults[1].id)
              const betUser3 = await bets.getBetsByGroupAndUser(group_id, getResults[2].id)
              for (a of betUser1) {
                await bets.updateBetAfterGivenPoints(a.id)
              }
              for (b of betUser2) {
                await bets.updateBetAfterGivenPoints(b.id)
              }
              for (c of betUser3) {
                await bets.updateBetAfterGivenPoints(c.id)
              }
              const KoalaPrize1 = Math.ceil(70 * KoalaPrize / 100)
              const KoalaPrize2 = Math.ceil(15 * KoalaPrize / 100)
              await bets.addPointsToUser(getResults[0].id, KoalaPrize1)
              await bets.addPointsToHistory(getResults[0].id, group_id, KoalaPrize1)
              await bets.addPointsToUser(getResults[1].id, KoalaPrize2)
              await bets.addPointsToHistory(getResults[1].id, group_id, KoalaPrize2)
              await bets.addPointsToUser(getResults[2].id, KoalaPrize2)
              await bets.addPointsToHistory(getResults[2].id, group_id, KoalaPrize2)
              await groups.updateStatusGroup(group_id, 'finished')
              return res.status(201).json({
                success: `Bravo ! ${KoalaPrize1} KoalaCoins distribué à ${getResults[0].username} et ${KoalaPrize2} distribué à ${getResults[1].username} et ${getResults[2].username}.`
              })
            }
            if (getResults[0].winning_bet === getResults[1].winning_bet && getResults[1].winning_bet !== getResults[2].winning_bet) {
              const betUser1 = await bets.getBetsByGroupAndUser(group_id, getResults[0].id)
              const betUser2 = await bets.getBetsByGroupAndUser(group_id, getResults[1].id)
              const betUser3 = await bets.getBetsByGroupAndUser(group_id, getResults[2].id)
              for (a of betUser1) {
                await bets.updateBetAfterGivenPoints(a.id)
              }
              for (b of betUser2) {
                await bets.updateBetAfterGivenPoints(b.id)
              }
              for (c of betUser3) {
                await bets.updateBetAfterGivenPoints(c.id)
              }
              const KoalaPrize1 = Math.ceil(50 * KoalaPrize / 100)
              await bets.addPointsToUser(getResults[0].id, KoalaPrize1)
              await bets.addPointsToHistory(getResults[0].id, group_id, KoalaPrize1)
              await bets.addPointsToUser(getResults[1].id, KoalaPrize1)
              await bets.addPointsToHistory(getResults[1].id, group_id, KoalaPrize1)
              await bets.addPointsToHistory(getResults[2].id, group_id, 0)
              await groups.updateStatusGroup(group_id, 'finished')
              return res.status(201).json({
                success: `Égalite entre ${getResults[0].username} ${getResults[1].username} ${KoalaPrize1} envoyé aux deux participants`
              })
            } else {
              const KoalaPrize1 = Math.ceil(80 * KoalaPrize / 100)
              const KoalaPrize2 = Math.ceil(20 * KoalaPrize / 100)
              const betUser1 = await bets.getBetsByGroupAndUser(group_id, getResults[0].id)
              const betUser2 = await bets.getBetsByGroupAndUser(group_id, getResults[1].id)
              const betUser3 = await bets.getBetsByGroupAndUser(group_id, getResults[2].id)
              for (a of betUser1) {
                await bets.updateBetAfterGivenPoints(a.id)
              }
              for (b of betUser2) {
                await bets.updateBetAfterGivenPoints(b.id)
              }
              for (c of betUser3) {
                await bets.updateBetAfterGivenPoints(c.id)
              }
              await bets.addPointsToUser(getResults[0].id, KoalaPrize1)
              await bets.addPointsToHistory(getResults[0].id, group_id, KoalaPrize1)
              await bets.addPointsToUser(getResults[1].id, KoalaPrize2)
              await bets.addPointsToHistory(getResults[1].id, group_id, KoalaPrize2)
              await bets.addPointsToUser(getResults[2].id, 0)
              await bets.addPointsToHistory(getResults[2].id, group_id, 0)
              await groups.updateStatusGroup(group_id, 'finished')
              return res.status(201).json({
                success: `Bravo ! ${KoalaPrize1} KoalaCoins distribué à ${getResults[0].username} et ${KoalaPrize2} KoalaCoins ${getResults[1].username}`
              })
            }
          }
          if (getResults.length === 4) {
            const KoalaPrize = Math.ceil(participantMultiple + matchMultiple);
            if (getResults[0].winning_bet === '0' && getResults[1].winning_bet === '0' && getResults[2].winning_bet === '0' && getResults[3].winning_bet === '0') {
              const betUser1 = await bets.getBetsByGroupAndUser(group_id, getResults[0].id)
              const betUser2 = await bets.getBetsByGroupAndUser(group_id, getResults[1].id)
              const betUser3 = await bets.getBetsByGroupAndUser(group_id, getResults[2].id)
              const betUser4 = await bets.getBetsByGroupAndUser(group_id, getResults[3].id)
              for (a of betUser1) {
                await bets.updateBetAfterGivenPoints(a.id)
              }
              for (b of betUser2) {
                await bets.updateBetAfterGivenPoints(b.id)
              }
              for (c of betUser3) {
                await bets.updateBetAfterGivenPoints(c.id)
              }
              for (d of betUser4) {
                await bets.updateBetAfterGivenPoints(d.id)
              }
              await groups.updateStatusGroup(group_id, 'finished')
              return res.status(201).json({
                success: 'Aucun Vainqueur, aucun KC distribué'
              })
            }
            if (getResults[0].winning_bet === getResults[1].winning_bet && getResults[1].winning_bet === getResults[2].winning_bet && getResults[2].winning_bet === getResults[3].winning_bet) {
              const betUser1 = await bets.getBetsByGroupAndUser(group_id, getResults[0].id)
              const betUser2 = await bets.getBetsByGroupAndUser(group_id, getResults[1].id)
              const betUser3 = await bets.getBetsByGroupAndUser(group_id, getResults[2].id)
              const betUser4 = await bets.getBetsByGroupAndUser(group_id, getResults[3].id)
              for (a of betUser1) {
                await bets.updateBetAfterGivenPoints(a.id)
              }
              for (b of betUser2) {
                await bets.updateBetAfterGivenPoints(b.id)
              }
              for (c of betUser3) {
                await bets.updateBetAfterGivenPoints(c.id)
              }
              for (d of betUser4) {
                await bets.updateBetAfterGivenPoints(d.id)
              }
              const KoalaPrizeEqual = Math.ceil(KoalaPrize / getResults.length)
              await bets.addPointsToUser(getResults[0].id, KoalaPrizeEqual)
              await bets.addPointsToHistory(getResults[0].id, group_id, KoalaPrizeEqual)
              await bets.addPointsToUser(getResults[1].id, KoalaPrizeEqual)
              await bets.addPointsToHistory(getResults[1].id, group_id, KoalaPrizeEqual)
              await bets.addPointsToUser(getResults[2].id, KoalaPrizeEqual)
              await bets.addPointsToHistory(getResults[2].id, group_id, KoalaPrizeEqual)
              await bets.addPointsToUser(getResults[3].id, KoalaPrizeEqual)
              await bets.addPointsToHistory(getResults[3].id, group_id, KoalaPrizeEqual)
              await bets.addPointsToHistory(getResults[4].id, group_id, 0)
              await groups.updateStatusGroup(group_id, 'finished')
              return res.status(201).json({
                success: `Égalite ${KoalaPrize} partagé entre les 3 participants`
              })
            }
            if (getResults[0].winning_bet === getResults[1].winning_bet && getResults[1].winning_bet === getResults[2].winning_bet && getResults[2].winning_bet !== getResults[3].winning_bet) {
              const betUser1 = await bets.getBetsByGroupAndUser(group_id, getResults[0].id)
              const betUser2 = await bets.getBetsByGroupAndUser(group_id, getResults[1].id)
              const betUser3 = await bets.getBetsByGroupAndUser(group_id, getResults[2].id)
              const betUser4 = await bets.getBetsByGroupAndUser(group_id, getResults[3].id)
              for (a of betUser1) {
                await bets.updateBetAfterGivenPoints(a.id)
              }
              for (b of betUser2) {
                await bets.updateBetAfterGivenPoints(b.id)
              }
              for (c of betUser3) {
                await bets.updateBetAfterGivenPoints(c.id)
              }
              for (d of betUser4) {
                await bets.updateBetAfterGivenPoints(d.id)
              }
              const KoalaPrize = Math.ceil(33 * 100 / KoalaPrize)
              await bets.addPointsToUser(getResults[0].id, KoalaPrize)
              await bets.addPointsToHistory(getResults[0].id, group_id, KoalaPrize)
              await bets.addPointsToUser(getResults[1].id, KoalaPrize)
              await bets.addPointsToHistory(getResults[1].id, group_id, KoalaPrize)
              await bets.addPointsToUser(getResults[2].id, KoalaPrize)
              await bets.addPointsToHistory(getResults[2].id, group_id, KoalaPrize)
              await bets.addPointsToHistory(getResults[3].id, group_id, 0)
              await groups.updateStatusGroup(group_id, 'finished')
              return res.status(201).json({
                success: `Bravo ! ${KoalaPrize} KoalaCoins distribué à ${getResults[0].username}, ${getResults[1].username} et ${getResults[2].username}.`
              })
            }
            if (getResults[0].winning_bet === getResults[1].winning_bet && getResults[1].winning_bet !== getResults[2].winning_bet && getResults[2].winning_bet !== getResults[3].winning_bet) {
              const betUser1 = await bets.getBetsByGroupAndUser(group_id, getResults[0].id)
              const betUser2 = await bets.getBetsByGroupAndUser(group_id, getResults[1].id)
              const betUser3 = await bets.getBetsByGroupAndUser(group_id, getResults[2].id)
              const betUser4 = await bets.getBetsByGroupAndUser(group_id, getResults[3].id)
              for (a of betUser1) {
                await bets.updateBetAfterGivenPoints(a.id)
              }
              for (b of betUser2) {
                await bets.updateBetAfterGivenPoints(b.id)
              }
              for (c of betUser3) {
                await bets.updateBetAfterGivenPoints(c.id)
              }
              for (d of betUser4) {
                await bets.updateBetAfterGivenPoints(d.id)
              }
              const KoalaPrizes = Math.ceil(50 * 100 / KoalaPrize)
              await bets.addPointsToUser(getResults[0].id, KoalaPrizes)
              await bets.addPointsToHistory(getResults[0].id, group_id, KoalaPrizes)
              await bets.addPointsToUser(getResults[1].id, KoalaPrizes)
              await bets.addPointsToHistory(getResults[1].id, group_id, KoalaPrizes)
              await bets.addPointsToHistory(getResults[2].id, group_id, 0)
              await bets.addPointsToHistory(getResults[3].id, group_id, 0)
              await groups.updateStatusGroup(group_id, 'finished')
              return res.status(201).json({
                success: `Bravo ! ${KoalaPrizes} KoalaCoins distribué à ${getResults[0].username}, ${getResults[1].username}.`
              })
            } else {
              const betUser1 = await bets.getBetsByGroupAndUser(group_id, getResults[0].id)
              const betUser2 = await bets.getBetsByGroupAndUser(group_id, getResults[1].id)
              const betUser3 = await bets.getBetsByGroupAndUser(group_id, getResults[2].id)
              const betUser4 = await bets.getBetsByGroupAndUser(group_id, getResults[3].id)
              for (a of betUser1) {
                await bets.updateBetAfterGivenPoints(a.id)
              }
              for (b of betUser2) {
                await bets.updateBetAfterGivenPoints(b.id)
              }
              for (c of betUser3) {
                await bets.updateBetAfterGivenPoints(c.id)
              }
              for (d of betUser4) {
                await bets.updateBetAfterGivenPoints(d.id)
              }
              const KoalaPrize1 = Math.ceil(80 * 100 / KoalaPrize)
              const KoalaPrize2 = Math.ceil(15 * 100 / KoalaPrize)
              const KoalaPrize3 = Math.ceil(5 * 100 / KoalaPrize)
              await bets.addPointsToUser(getResults[0].id, KoalaPrize1)
              await bets.addPointsToHistory(getResults[0].id, group_id, KoalaPrize1)
              await bets.addPointsToUser(getResults[1].id, KoalaPrize2)
              await bets.addPointsToHistory(getResults[1].id, group_id, KoalaPrize2)
              await bets.addPointsToUser(getResults[2].id, KoalaPrize3)
              await bets.addPointsToHistory(getResults[2].id, group_id, KoalaPrize3)
              await bets.addPointsToHistory(getResults[3].id, group_id, 0)
              await groups.updateStatusGroup(group_id, 'finished')
              return res.status(201).json({
                success: `Bravo ! ${KoalaPrize1} KoalaCoins distribué à ${getResults[0].username} , ${KoalaPrize2} KoalaCoins distribué à ${getResults[1].username} et ${KoalaPrize3} KoalaCoins distribué à ${getResults[2].username}`
              })
            }
          }
          if (getResults.length === 5) {
            const KoalaPrize = Math.ceil(participantMultiple + matchMultiple);
            if (getResults[0].winning_bet === '0' && getResults[1].winning_bet === '0' && getResults[2].winning_bet === '0' && getResults[3].winning_bet === '0' && getResults[3].winning_bet === '0' && getResults[4].winning_bet === '0') {
              const betUser1 = await bets.getBetsByGroupAndUser(group_id, getResults[0].id)
              const betUser2 = await bets.getBetsByGroupAndUser(group_id, getResults[1].id)
              const betUser3 = await bets.getBetsByGroupAndUser(group_id, getResults[2].id)
              const betUser4 = await bets.getBetsByGroupAndUser(group_id, getResults[3].id)
              const betUser5 = await bets.getBetsByGroupAndUser(group_id, getResults[4].id)
              for (a of betUser1) {
                await bets.updateBetAfterGivenPoints(a.id)
              }
              for (b of betUser2) {
                await bets.updateBetAfterGivenPoints(b.id)
              }
              for (c of betUser3) {
                await bets.updateBetAfterGivenPoints(c.id)
              }
              for (d of betUser4) {
                await bets.updateBetAfterGivenPoints(d.id)
              }
              for (e of betUser5) {
                await bets.updateBetAfterGivenPoints(e.id)
              }
              await groups.updateStatusGroup(group_id, 'finished')
              return res.status(201).json({
                success: 'Aucun Vainqueur, aucun KC distribué'
              })
            }
            if (getResults[0].winning_bet === getResults[1].winning_bet && getResults[1].winning_bet === getResults[2].winning_bet && getResults[2].winning_bet === getResults[3].winning_bet && getResults[3].winning_bet === getResults[4].winning_bet) {
              const KoalaPrizeEqual = Math.ceil(KoalaPrize / getResults.length)
              const betUser1 = await bets.getBetsByGroupAndUser(group_id, getResults[0].id)
              const betUser2 = await bets.getBetsByGroupAndUser(group_id, getResults[1].id)
              const betUser3 = await bets.getBetsByGroupAndUser(group_id, getResults[2].id)
              const betUser4 = await bets.getBetsByGroupAndUser(group_id, getResults[3].id)
              const betUser5 = await bets.getBetsByGroupAndUser(group_id, getResults[4].id)
              for (a of betUser1) {
                await bets.updateBetAfterGivenPoints(a.id)
              }
              for (b of betUser2) {
                await bets.updateBetAfterGivenPoints(b.id)
              }
              for (c of betUser3) {
                await bets.updateBetAfterGivenPoints(c.id)
              }
              for (d of betUser4) {
                await bets.updateBetAfterGivenPoints(d.id)
              }
              for (e of betUser5) {
                await bets.updateBetAfterGivenPoints(e.id)
              }
              await bets.addPointsToUser(getResults[0].id, KoalaPrizeEqual)
              await bets.addPointsToHistory(getResults[0].id, group_id, KoalaPrizeEqual)
              await bets.addPointsToUser(getResults[1].id, KoalaPrizeEqual)
              await bets.addPointsToHistory(getResults[1].id, group_id, KoalaPrizeEqual)
              await bets.addPointsToUser(getResults[2].id, KoalaPrizeEqual)
              await bets.addPointsToHistory(getResults[2].id, group_id, KoalaPrizeEqual)
              await bets.addPointsToUser(getResults[3].id, KoalaPrizeEqual)
              await bets.addPointsToHistory(getResults[3].id, group_id, KoalaPrizeEqual)
              await bets.addPointsToUser(getResults[4].id, KoalaPrizeEqual)
              await bets.addPointsToHistory(getResults[4].id, group_id, KoalaPrizeEqual)
              await groups.updateStatusGroup(group_id, 'finished')
              return res.status(201).json({
                success: `Bravo ! ${KoalaPrizeEqual} KoalaCoins distribué à ${getResults[0].username}, ${getResults[1].username}, ${getResults[2].username}, ${getResults[3].username} et ${getResults[4].username}.`
              })
            }
            if (getResults[0].winning_bet === getResults[1].winning_bet && getResults[1].winning_bet === getResults[2].winning_bet && getResults[2].winning_bet === getResults[3].winning_bet && getResults[3].winning_bet !== getResults[4].winning_bet) {
              const KoalaPrizeEqual = Math.ceil(25 * KoalaPrize / 100)
              const betUser1 = await bets.getBetsByGroupAndUser(group_id, getResults[0].id)
              const betUser2 = await bets.getBetsByGroupAndUser(group_id, getResults[1].id)
              const betUser3 = await bets.getBetsByGroupAndUser(group_id, getResults[2].id)
              const betUser4 = await bets.getBetsByGroupAndUser(group_id, getResults[3].id)
              const betUser5 = await bets.getBetsByGroupAndUser(group_id, getResults[4].id)
              for (a of betUser1) {
                await bets.updateBetAfterGivenPoints(a.id)
              }
              for (b of betUser2) {
                await bets.updateBetAfterGivenPoints(b.id)
              }
              for (c of betUser3) {
                await bets.updateBetAfterGivenPoints(c.id)
              }
              for (d of betUser4) {
                await bets.updateBetAfterGivenPoints(d.id)
              }
              for (e of betUser5) {
                await bets.updateBetAfterGivenPoints(e.id)
              }
              await bets.addPointsToUser(getResults[0].id, KoalaPrizeEqual)
              await bets.addPointsToHistory(getResults[0].id, group_id, KoalaPrizeEqual)
              await bets.addPointsToUser(getResults[1].id, KoalaPrizeEqual)
              await bets.addPointsToHistory(getResults[1].id, group_id, KoalaPrizeEqual)
              await bets.addPointsToUser(getResults[2].id, KoalaPrizeEqual)
              await bets.addPointsToHistory(getResults[2].id, group_id, KoalaPrizeEqual)
              await bets.addPointsToUser(getResults[3].id, KoalaPrizeEqual)
              await bets.addPointsToHistory(getResults[3].id, group_id, KoalaPrizeEqual)
              await bets.addPointsToHistory(getResults[4].id, group_id, 0)
              await groups.updateStatusGroup(group_id, 'finished')
              return res.status(201).json({
                success: `Bravo ! ${KoalaPrizeEqual} KoalaCoins distribué à ${getResults[0].username} , ${KoalaPrize2} KoalaCoins distribué à ${getResults[1].username} , ${KoalaPrize3} KoalaCoins distribué à ${getResults[2].username} et ${KoalaPrize4} KoalaCoins distribué à ${getResults[3].username}`
              })
            }
            if (getResults[0].winning_bet === getResults[1].winning_bet && getResults[1].winning_bet === getResults[2].winning_bet && getResults[2].winning_bet !== getResults[3].winning_bet && getResults[3].winning_bet !== getResults[4].winning_bet) {
              const KoalaPrizeEqual = Math.ceil(33 * KoalaPrize / 100)
              const betUser1 = await bets.getBetsByGroupAndUser(group_id, getResults[0].id)
              const betUser2 = await bets.getBetsByGroupAndUser(group_id, getResults[1].id)
              const betUser3 = await bets.getBetsByGroupAndUser(group_id, getResults[2].id)
              const betUser4 = await bets.getBetsByGroupAndUser(group_id, getResults[3].id)
              const betUser5 = await bets.getBetsByGroupAndUser(group_id, getResults[4].id)
              for (a of betUser1) {
                await bets.updateBetAfterGivenPoints(a.id)
              }
              for (b of betUser2) {
                await bets.updateBetAfterGivenPoints(b.id)
              }
              for (c of betUser3) {
                await bets.updateBetAfterGivenPoints(c.id)
              }
              for (d of betUser4) {
                await bets.updateBetAfterGivenPoints(d.id)
              }
              for (e of betUser5) {
                await bets.updateBetAfterGivenPoints(e.id)
              }
              await bets.addPointsToUser(getResults[0].id, KoalaPrizeEqual)
              await bets.addPointsToHistory(getResults[0].id, group_id, KoalaPrizeEqual)
              await bets.addPointsToUser(getResults[1].id, KoalaPrizeEqual)
              await bets.addPointsToHistory(getResults[1].id, group_id, KoalaPrizeEqual)
              await bets.addPointsToUser(getResults[2].id, KoalaPrizeEqual)
              await bets.addPointsToHistory(getResults[2].id, group_id, KoalaPrizeEqual)
              await bets.addPointsToHistory(getResults[3].id, group_id, 0)
              await bets.addPointsToHistory(getResults[4].id, group_id, 0)
              await groups.updateStatusGroup(group_id, 'finished')
              return res.status(201).json({
                success: `Bravo ! ${KoalaPrizeEqual} KoalaCoins distribué à ${getResults[0].username}, ${getResults[1].username} et ${getResults[2].username}.`
              })
            } else {
              const KoalaPrize1 = Math.ceil(70 * KoalaPrize / 100)
              const KoalaPrize2 = Math.ceil(15 * KoalaPrize / 100)
              const KoalaPrize3 = Math.ceil(10 * KoalaPrize / 100)
              const KoalaPrize4 = Math.ceil(5 * KoalaPrize / 100)
              const betUser1 = await bets.getBetsByGroupAndUser(group_id, getResults[0].id)
              const betUser2 = await bets.getBetsByGroupAndUser(group_id, getResults[1].id)
              const betUser3 = await bets.getBetsByGroupAndUser(group_id, getResults[2].id)
              const betUser4 = await bets.getBetsByGroupAndUser(group_id, getResults[3].id)
              const betUser5 = await bets.getBetsByGroupAndUser(group_id, getResults[4].id)
              for (a of betUser1) {
                await bets.updateBetAfterGivenPoints(a.id)
              }
              for (b of betUser2) {
                await bets.updateBetAfterGivenPoints(b.id)
              }
              for (c of betUser3) {
                await bets.updateBetAfterGivenPoints(c.id)
              }
              for (d of betUser4) {
                await bets.updateBetAfterGivenPoints(d.id)
              }
              for (e of betUser5) {
                await bets.updateBetAfterGivenPoints(e.id)
              }
              await bets.addPointsToUser(getResults[0].id, KoalaPrize1)
              await bets.addPointsToHistory(getResults[0].id, group_id, KoalaPrize1)
              await bets.addPointsToUser(getResults[1].id, KoalaPrize2)
              await bets.addPointsToHistory(getResults[1].id, group_id, KoalaPrize2)
              await bets.addPointsToUser(getResults[2].id, KoalaPrize3)
              await bets.addPointsToHistory(getResults[2].id, group_id, KoalaPrize3)
              await bets.addPointsToUser(getResults[3].id, KoalaPrize4)
              await bets.addPointsToHistory(getResults[3].id, group_id, KoalaPrize4)
              await bets.addPointsToHistory(getResults[4].id, group_id, 0)
              await groups.updateStatusGroup(group_id, 'finished')
              return res.status(201).json({
                success: `Bravo ! ${KoalaPrize1} KoalaCoins distribué à ${getResults[0].username} , ${KoalaPrize2} KoalaCoins distribué à ${getResults[1].username} , ${KoalaPrize3} KoalaCoins distribué à ${getResults[2].username} et ${KoalaPrize4} KoalaCoins distribué à ${getResults[3].username}`
              })
            }
          }
        } else {
          return res.status(200).json({
            error: 'Paris toujours en cours'
          })
        }
      }
      if (getResults.length <= 0) return res.status(200).json({
        error: 'Aucun paris détecté dans ce groupe'
      })
      return res.status(200).json({
        error: 'Paris toujours en cours'
      })
    } catch (e) {
      console.log(e)
      return res.status(200).json({
        error: 'Un Problème est survenu.'
      })
    }
  }
};
module.exports = betController;