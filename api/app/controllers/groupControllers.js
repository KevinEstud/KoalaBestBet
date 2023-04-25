require('dotenv').config();
const groups = require('../dataMappers/group');
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
const onlyLettersNumbersPattern = /^[A-Za-z0-9]+$/;
const groupController = {
  groupCreation: async (req, res) => {
    const {
      name,
      nbJoueurs,
      isprivate
    } = req.body;
    const match_id = req.body.matchs_id;
    const group_matchs =  req.body.groupmatchs
    try {
      //Je vérifie qu'un nom de groupe a bien été saisie.
      if (!name) return res.status(200).json({
        error: 'Entrez un nom de groupe'
      })
      //Je fait une regex pour vérifier qu'il y a bien que des lettres et des nombres présent.
      if (!name.match(onlyLettersNumbersPattern)) {
        return res.status(200).json({
          error: 'Veuillez entrer un nom de groupe valide, Exemple : LesKoalas ! Sans espace et caracteres speciaux !'
        })
      }
      if (!nbJoueurs || isNaN(nbJoueurs)) return res.status(200).json({
        error: 'Veuillez Renseigner/Vérifier le nombre de joueurs'
      })
      //Je vérifie qu'il y a bien 5 joueurs ou moins
      if (nbJoueurs > 5) return res.status(200).json({
        error: 'Maximum 5 joueurs !'
      })
      //Je vérifie qu'il y a bien 2 joueurs ou plus
      if (nbJoueurs < 2) return res.status(200).json({
        error: 'Minimum 2 joueurs !'
      })
      //Je vérifie que des match_id ont bien été fournis
      if (typeof match_id === 'undefined' || match_id?.length === 0 || !match_id) return res.status(200).json({
        error: 'Veuillez renseigner les matchs.'
      })
      //Je vérifie que les match_id sont bien des number
      if (!match_id.every(type => typeof type == 'number')) return res.status(200).json({
        error: 'Veuillez vérifier les matchs renseignés.'
      })
      //Je vérifie qu'il y a bien 5 Matchs maximum de saisis
      if (match_id.length > 5) return res.status(200).json({
        error: 'Veuillez saisir maximum 5 matchs !'
      })
      //Si un groupe portant le meme nom existe deja, l'utilisateur devra en saisir un nouveau.
      const groupId = await groups.getGroupIdByGroupName(name.toLowerCase())
      if (typeof groupId != 'undefined') {
        return res.status(200).json({
          error: 'Veuillez saisir un nom différent, celui-ci est déjà utilisé.'
        })
      }
      const userInfos = jwt.decode(req.cookies.jwt, process.env.JWT_REFRESH_SECRET, (err, user) => {
        if (err) return res.status(403).send({
          error: 'Token Invalide !'
        })
        return user;
      })
      //Si l'utilisateur a déja créer un groupe, il doit en supprimer un, la vérification se faire en base de donnée
      const tryId = await groups.getLeaderFromGroup(userInfos.userId).then((res) => res).catch((e) => console.error(e))
      if (tryId.length >= 1) return res.status(200).json({
        error: 'Vous avez déjà crée un groupe veuillez le supprimer et en créer un autre !'
      })
      async function invitationLink() {
        //Je génère mon lien d'invitation
        let invitation_code = require('crypto').randomBytes(32).toString('hex')
        let verify = await groups.verifyValidityOfInvitationLink(invitation_code.toLowerCase()).then((res) => res).catch((e) => console.error(e))
        //Je vérifie coté base de donnée qu'un lien identique n'existe pas
        if(verify.length > 0) {
          //Si c'est le cas je rappel ma fonction pour en générer un autre
          return invitationLink();
        }
          //Le cas écheant je return tout simplement le code d'invitation
        return invitation_code ;
      }
      //J'appelle ma fonction invitationLink qui me permettra de générer un code d'invitation et également vérifier que ce dernier n'existe pas déja
      //En base de donnée, le cas écheant, j'en regénère un nouveau
      let invitation_link ;
      await invitationLink().then((e) => invitation_link = e);
      const resp = await groups.createGroup(name, invitation_link, nbJoueurs, userInfos.userId, isprivate);
      if (resp) {
        const groupIdv = await groups.getGroupIdByGroupName(name.toLowerCase()).then((res) => res)
        for (a of match_id) {
          await groups.addMatchsToDatabase(a).then((e) => e)
        }
        for (a of match_id) {
          await groups.LinkMatchsForOneGroup(groupIdv.id, a).then((e) => e)
        }
        await groups.linkGroupAndUser(groupIdv.id, userInfos.userId)
        if(!isprivate) {
          if(!group_matchs) return res.status(200).json({
            error: 'Veuillez vérifier les informations saisies.'
          })
          await groups.linkGroupAndMatches(groupIdv.id, group_matchs)
        } 
        return res.status(201).json({
          success: "Group Created",
          invitation_link: `${invitation_link}`
        })

      }
      return res.status(200).json({
        error: "Une erreur est survenue.",
      })
    } catch (e) {
            return res.status(200).json({
        error: 'Un Problème est survenu.'
      })
    }
  },
  getMatchsInfosByGroupName: async (req, res) => {
    const group_name = req.params.name;
    try {
      //Je vérifie qu'un nom de groupe a bien été saisie.
      if (!group_name) return res.status(200).json({
        error: 'Entrez un nom de groupe.'
      })
      //Je fait une regex pour vérifier qu'il y a bien que des lettres et des nombres présent.
      if (!group_name.match(onlyLettersNumbersPattern)) {
        return res.status(200).json({
          error: 'Veuillez entrer un nom de groupe valide, Exemple : LesKoalas ! Sans espace et caracteres speciaux !'
        })
      }
      jwt.decode(req.cookies.jwt, process.env.JWT_REFRESH_SECRET, (err, user) => {
        if (err) return res.status(403).send({
          error: 'Token Invalide !'
        })
        return user;
      })
      const resp = await groups.getInfosFromGroupIfPublicByName(group_name);
      if (resp) {
        return res.status(201).json(resp)

      }
      return res.status(200).json({
        error: "Vous n\'avez pas accès aux infos de ce groupe.",
      })
    } catch (e) {
            return res.status(200).json({
        error: 'Un Problème est survenu.'
      })
    }
  },
  joinGroup: async (req, res) => {
    try {
      const {
        invitation_link
      } = req.params;
      if (invitation_link.length >= 65 || invitation_link.length <= 63 || !invitation_link.match(onlyLettersNumbersPattern)) return res.status(200).json({
        error: 'Veuillez vérifier votre lien d\'invitation'
      })
      const verifyInvitation = await groups.verifyValidityOfInvitationLink(invitation_link.toLowerCase()).then((res) => res).catch((e) => console.error(e))
      if (!verifyInvitation || typeof verifyInvitation === 'undefined' || verifyInvitation <= 0) return res.status(200).json({
        error: 'Veuillez vérifier votre lien d\'invitation'
      })
      let verifuser;
      verifyInvitation.forEach((element) => verifuser = element.id)
      const verifyIfUserAllreadyOnGroup = await groups.getInfosFromGroup(verifuser)
      let compareResult;
      const userInfos = jwt.decode(req.cookies.jwt, process.env.JWT_REFRESH_SECRET, (err, user) => {
        if (err) return res.status(403).send({
          error: 'Token Invalide !'
        })
        return user;
      })
      verifyIfUserAllreadyOnGroup.filter((element) => element.id === userInfos.userId).forEach((element) => compareResult = element)
      if (verifyIfUserAllreadyOnGroup.length >= verifyInvitation[0].players_number) return res.status(200).json({
        error: 'Capacité Max du groupe atteinte !'
      })
      if (!compareResult) {
        await groups.linkGroupAndUser(verifuser, userInfos.userId).then((res) => res).catch((e) => console.error(e))
        return res.status(201).json({
          succes: `Vous avez rejoins le groupe aves succès !`
        })
      }
      return res.status(200).json({
        error: 'Vous avez déjà rejoins ce groupe !'
      })
    } catch (e) {
      return res.status(200).json({
        error: 'Un Problème est survenu.'
      })
    }
  },
  joinPrivateGroup: async (req, res) => {
    try {
      const {
        group_id
      } = req.params;
      if (isNaN(group_id)|| !group_id) return res.status(200).json({
        error: 'Veuillez vérifier le groupe que vous voulez rejoindre.'
      })
      const userInfos = jwt.decode(req.cookies.jwt, process.env.JWT_REFRESH_SECRET, (err, user) => {
        if (err) return res.status(403).send({
          error: 'Token Invalide !'
        })
        return user;
      })
      const verifyIfUserAllreadyOnGroup = await groups.getInfosFromGroup(group_id)
      let compareResult;
      verifyIfUserAllreadyOnGroup.filter((element) => element.id === userInfos.userId).forEach((element) => compareResult = element)
      const allInfosFromGroup = await groups.getInfosFromGroupIfPublicById(group_id)
      if (allInfosFromGroup.nb_participants === allInfosFromGroup.nb_participants_max) {
        return res.status(200).json({
          error: 'Capacité Max du groupe atteinte !'
        })
      } 
      if (!compareResult) {
        await groups.linkGroupAndUser(group_id, userInfos.userId)
        return (
          res.status(201).json({
            success: `Vous avez rejoins le groupe aves succès !`
          })
          ) 
      }
      return res.status(200).json({
        error: 'Vous avez déjà rejoins ce groupe !'
      })
    } catch (e) {
      return res.status(200).json({
        error: 'Un Problème est survenu.'
      })
    }
  },
  //Permet d'afficher les groupes d'un utilisateur
  getGroupByUserId: async (req, res) => {
    try {
      const userInfos = jwt.decode(req.cookies.jwt, process.env.JWT_REFRESH_SECRET, (err, user) => {
        if (err) return res.status(403).send({
          error: 'Token Invalide !'
        })
        return user;
      })
      if (isNaN(userInfos.userId)) return res.status(200).json({
        error: 'Veuillez vérifier l\'ID spécifié'
      })
        const infosGroup = await groups.getGroupsOfUser(userInfos.userId)
        if(infosGroup){
          return res.status(201).json(infosGroup)
        }
        return res.status(200).json({
        error: 'Vous n\'avez pas accès aux infos de cette user.'
      })
    } catch (e) {
      return res.status(200).json({
        error: 'Un Problème est survenu.'
      })
    }
  },
  //Permet de supprimer ou quitter un groupe
  deleteGroup: async (req, res) => {
    try {
      const group_id = parseInt(req.params.group_id);
      const userInfos = jwt.decode(req.cookies.jwt, process.env.JWT_REFRESH_SECRET, (err, user) => {
        if (err) return res.status(403).send({
          error: 'Token Invalide !'
        })
        return user;
      })
      if (isNaN(group_id) || isNaN(userInfos.userId)) return res.status(200).json({
        error: 'Veuillez vérifier l\'ID spécifié'
      })
      const infosGroup = await groups.getInfosFromGroup(group_id)
      let compareResult;
      infosGroup.filter((element) => element.user_id === userInfos.userId).forEach((element) => compareResult = element)
      if (compareResult) {
        let checkIfLead;
        infosGroup.filter((element) => element.group_leader_id === userInfos.userId).forEach((element) => checkIfLead = element);
        //Si l'utilisateur qui appel le groupe est le leader, alors le groupe sera supprimé
        if (checkIfLead) {
          await groups.deleteGroup(group_id)
          return res.status(201).json({
            success: `Vous avez réussi à supprimer le groupe`
          })
        } else {
        //Dans le cas contraire, il quitte uniquement le groupe      
          await groups.leaveGroup(userInfos.userId, group_id)
          return res.status(201).json({
            success: `Vous avez quitté le groupe : ${group_id}!`
          })
        }
      }
      return res.status(200).json({
        error: 'Impossible de supprimer ou quitter le groupe !'
      })
    } catch (e) {
      return res.status(200).json({
        error: 'Un Problème est survenu.'
      })
    }
  },
  //Permet d'afficher le classement d'un groupe
  rankingOfGroup: async (req, res) => {
    const group_id = parseInt(req.params.group_id)
    try {
      if (!group_id) return res.status(200).json({
        error: 'Veuillez renseigner l\'ID du groupe'
      })
      //
      const userInfos = jwt.decode(req.cookies.jwt, process.env.JWT_REFRESH_SECRET, (err, user) => {
        if (err) return res.status(403).send({
          error: 'Token Invalide !'
        })
        return user;
      })
      const betUser = await bets.getBetsByGroupAndUser(group_id, userInfos.userId)
      if (betUser.length <= 0) return res.status(200).json({
        error: 'Vous n\'avez pas encore parié dans ce groupe!'
      })
      const groupInfos = await groups.getInfosFromGroup(group_id).then((res) => res).catch((e) => console.error(e))
      if (typeof groupInfos[0] === 'undefined') return res.status(200).json({
        error: 'Veuillez vérifier l\'ID du groupe renseigné'
      })
      const verifyUser = groupInfos.find(element => element.id === userInfos.userId)
      if (!verifyUser) return res.status(200).json({
        error: 'Vous n\'avez pas accès aux infos de ce groupe !'
      })
      let getResults = await groups.getMatchOfGroup(group_id, userInfos.userId);
      let getRanking = await groups.getRankOfGroup(group_id);
      if (getResults.length > 0) {
        let matches = [];
        let betFromUser = [];
        let matchesComing = [];
        let liveMatches = [];
        let matchFinished = [];
        let betFromUserA = [];
        let matchesCanceled = []; 
        let matchesPostponed = []; 
        for (a of betUser) {
          matches.push(a.match_pandascore)
        }
        const matchsid = matches.join(',')
        //Je recupère les infos des matchs d'un groupe via l'API de pandascore
        await fetch(`https://api.pandascore.co/matches?filter[id]=${matchsid}&page=1&per_page=100`, options)
          .then(response => {
            return response.json()
          })
          .then(response => {
            betFromUser.push(response)
          })
          .catch(err => console.error(err));
            for(var i = 0; i < betUser.length;) {
              if(betFromUser[0][i].id === betUser[i].match_pandascore && betFromUser[0][i].opponents[0].opponent.id === betUser[i].bet ){
              betFromUserA.push({
                          id: betUser[i].bet,
                          name: betFromUser[0][i].name,
                          team_logo: betFromUser[0][i].opponents[0].opponent.image_url??'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Question_mark_alternate.svg/langfr-90px-Question_mark_alternate.svg.png',
                          winner_bet: betFromUser[0][i].opponents[0].opponent.name
                        })
                      } else
             if(betFromUser[0][i].id === betUser[i].match_pandascore &&  betFromUser[0][i].opponents[1].opponent.id === betUser[i].bet) {
              betFromUserA.push({
                id: betUser[i].bet,
                name: betFromUser[0][i].name,
                team_logo: betFromUser[0][i].opponents[1].opponent.image_url??'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Question_mark_alternate.svg/langfr-90px-Question_mark_alternate.svg.png',
                winner_bet: betFromUser[0][i].opponents[1].opponent.name
              })
             
            }
            i++;
          }
          for (b of betFromUser) {
          //Je vérifie si le statut du match est en 'finished' et je push dans le tableau matchFinished
          b.find((element) => {
            if (element.status === 'finished') {
              matchFinished.push({
                id: element.id,
                match_name: element.name,
                team1_name: element.opponents[0].opponent.name,
                team1_logo: element.opponents[0].opponent.image_url??'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Question_mark_alternate.svg/langfr-90px-Question_mark_alternate.svg.png',
                team1_score: element.results[0].score,
                team2_name: element.opponents[1].opponent.name,
                team2_logo: element.opponents[1].opponent.image_url??'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Question_mark_alternate.svg/langfr-90px-Question_mark_alternate.svg.png',
                team2_score: element.results[1].score
              })
            }
            if (element.status === 'running') {
              liveMatches.push({
                id: element.id,
                match_name: element.name,
                live_official: element?.official_stream_url,
                team1_name: element.opponents[0].opponent.name,
                team1_logo: element.opponents[0].opponent.image_url??'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Question_mark_alternate.svg/langfr-90px-Question_mark_alternate.svg.png',
                team1_score: element.results[0].score,
                team2_name: element.opponents[1].opponent.name,
                team2_logo: element.opponents[1].opponent.image_url??'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Question_mark_alternate.svg/langfr-90px-Question_mark_alternate.svg.png',
                team2_score: element.results[1].score
              })
            }
            //Je vérifie si le statut du match est en 'not_started' et je push dans le tableau matchesComing
            if (element.status === 'not_started') {
              let utcDate = new Date(element.scheduled_at);
              let myLocalDate = new Date(Date.UTC(
                utcDate.getFullYear(),
                utcDate.getMonth(),
                utcDate.getDate(),
                utcDate.getHours() + 2,
                utcDate.getMinutes()
              ));
              matchesComing.push({
                id: element.id,
                match_begin_at: myLocalDate.toLocaleString("fr"),
                match_name: element.name,
                live_twitch: element.live_embed_url,
                team1_name: element.opponents[0].opponent.name,
                team1_logo: element.opponents[0].opponent.image_url??'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Question_mark_alternate.svg/langfr-90px-Question_mark_alternate.svg.png',
                team2_name: element.opponents[1].opponent.name,
                team2_logo: element.opponents[1].opponent.image_url??'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Question_mark_alternate.svg/langfr-90px-Question_mark_alternate.svg.png',
              })
            }
            //Je vérifie si le statut du match est en 'canceled' et je push dans le tableau matchesCanceled
            if (element.status === 'canceled') {
              let utcDate = new Date(element.scheduled_at);
              let myLocalDate = new Date(Date.UTC(
                utcDate.getFullYear(),
                utcDate.getMonth(),
                utcDate.getDate(),
                utcDate.getHours() + 2,
                utcDate.getMinutes()
              ));
              matchesCanceled.push({
                id: element.id,
                match_name: element.name,
                match_begin_at: myLocalDate.toLocaleString("fr"),
                live_twitch: element.live_embed_url,
                team1_name: element.opponents[0].opponent.name,
                team1_logo: element.opponents[0].opponent.image_url??'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Question_mark_alternate.svg/langfr-90px-Question_mark_alternate.svg.png',
                team2_name: element.opponents[1].opponent.name,
                team2_logo: element.opponents[1].opponent.image_url??'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Question_mark_alternate.svg/langfr-90px-Question_mark_alternate.svg.png',
              })
            }
            //Je vérifie si le statut du match est en 'postponed' et je push dans le tableau matchesPostponed
            if (element.status === 'postponed') {
              matchesPostponed.push({
                id: element.id,
                match_name: element.name,
                team1_name: element.opponents[0].opponent.name,
                team1_logo: element.opponents[0].opponent.image_url??'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Question_mark_alternate.svg/langfr-90px-Question_mark_alternate.svg.png',
                team2_name: element.opponents[1].opponent.name,
                team2_logo: element.opponents[1].opponent.image_url??'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Question_mark_alternate.svg/langfr-90px-Question_mark_alternate.svg.png',
              })
            }
          })
          
        }
        
        objBack = {
          invitationLink: groupInfos[0].invitation_link,
          playerRank: getRanking,
          betFromUser: betFromUserA,
          matchLive: liveMatches,
          matchIncoming: matchesComing,
          matchFinished: matchFinished,
          matchCanceled: matchesCanceled,
          matchPostponed: matchesPostponed
        }
        if(objBack?.invitationLink?.length > 0) {
          return res.status(201).json([objBack])
        } else {
          return res.status(200).json({
            error: 'Aucune informations disponible pour ce groupe.'
          })
        }
      }
      return res.status(200).json({
        error: 'Aucun paris détecté dans ce groupe'
      })

    } catch (e) {
      return res.status(200).json({
        error: 'Un Problème est survenu.'
      })
      
    }
    // []
  },
  getMatchsInfosByGroupId: async (req, res) => {
    const group_id = parseInt(req.params.group_id)
    try {
      if (!group_id) return res.status(200).json({
        error: 'Veuillez renseigner l\'ID du groupe'
      })
      //
      const userInfos = jwt.decode(req.cookies.jwt, process.env.JWT_REFRESH_SECRET, (err, user) => {
        if (err) return res.status(403).send({
          error: 'Token Invalide !'
        })
        return user;
      })
      const groupInfos = await groups.getInfosFromGroup(group_id).then((res) => res)
      if (typeof groupInfos[0] === 'undefined') return res.status(200).json({
        error: 'Veuillez vérifier l\'ID du groupe renseigné'
      })
      const verifyUser = groupInfos.filter(element => element.id === userInfos.userId)
      if (!verifyUser.length) return res.status(200).json({
        error: 'Vous n\'avez pas accès aux infos de ce groupe !'
      })
      const matches = await groups.getMatchOfGroup(group_id, userInfos.userId);
      let tryyy = [] ;
      let infosOfMatch = [];
      let infosOfMatchFiltered = [];
      if (matches.length <= 0) return res.status(200).json({
        error: 'Aucun match dans le groupe'
      })
      for (a of matches) {
        tryyy.push(a.match_pandascore)
      }
      const checkUser = await groups.checkIfUserBetOnGroup(group_id, userInfos.userId)
      if(checkUser?.hasBet) {
        return res.status(200).json({error: 'Vous avez déjà parié dans ce groupe.'})
      }
      const matchsid = tryyy.join(',')
      await fetch(`https://api.pandascore.co/matches?filter[id]=${matchsid}&sort=-id&page=1&per_page=100`, options)
        .then(response => response.json())
        .then(response => {
          for(a of response) {
            let dataDate = a.scheduled_at
             let utcDate = new Date(dataDate);
              let myLocalDate = new Date(Date.UTC(
                      utcDate.getFullYear(),
                      utcDate.getMonth(),
                      utcDate.getDate(),
                      utcDate.getHours() + 2,
                      utcDate.getMinutes()
                    ));
          infosOfMatch.push({
          match_begin_at: myLocalDate.toLocaleString("fr"),
          video_game: a.videogame.name,
          league: a.league.name,
          match_id: a.id,
          status: a.status,
          live_twitch: a.live_embed_url,
          match_name: a.name,
          number_of_games: a.number_of_games, 
          team1_id: a.opponents[0].opponent.id,
          team1_name: a.opponents[0].opponent.name,
          team1_logo: a.opponents[0].opponent.image_url??'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Question_mark_alternate.svg/langfr-90px-Question_mark_alternate.svg.png',
          team2_id: a.opponents[1].opponent.id,
          team2_name: a.opponents[1].opponent.name,
          team2_logo: a.opponents[1].opponent.image_url??'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Question_mark_alternate.svg/langfr-90px-Question_mark_alternate.svg.png'
          })
        }})
        .catch(err => console.error(err));
        for (var i = 0; i < matches.length;) {
          if(infosOfMatch[i].status === "not_started") {
          infosOfMatchFiltered.push({
          match_begin_at: infosOfMatch[i].match_begin_at,
          league: infosOfMatch[i].league,
          video_game: infosOfMatch[i].video_game,
          matchos_id: matches[i].id,
          match_id : infosOfMatch[i].match_id,
          live_twitch: infosOfMatch[i].live_twitch,
          match_name: infosOfMatch[i].match_name,
          number_of_games: infosOfMatch[i].number_of_games,
          team1_id: infosOfMatch[i].team1_id,
          team1_name: infosOfMatch[i].team1_name,
          team1_logo: infosOfMatch[i].team1_logo,
          team2_id: infosOfMatch[i].team2_id,
          team2_name: infosOfMatch[i].team2_name,
          team2_logo: infosOfMatch[i].team2_logo,
        })
          }
        i++;
      }
        if(infosOfMatchFiltered.length !== matches.length)  {
          await groups.updateStatusGroup(group_id, 'expired')
          return res.status(200).json({error : 'Vous n\'avez pas rejoins le groupe à temps, certains matchs ont déjà commencé sans que vous n\'ayez parié, veuillez rejoindre un autre groupe, ou en créer un autre.'})
        }
      return res.status(201).json(infosOfMatchFiltered)
    } catch (e) {
      return res.status(200).json({
        error: 'Un Problème est survenu.'
      })
    }
  },
  SimpleRankingOfGroup: async (req, res) => {
    const group_id = parseInt(req.params.group_id)
    try {
      if (!group_id) return res.status(200).json({
        error: 'Veuillez renseigner l\'ID du groupe'
      })
      const userInfos = jwt.decode(req.cookies.jwt, process.env.JWT_REFRESH_SECRET, (err, user) => {
        if (err) return res.status(403).send({
          error: 'Token Invalide !'
        })
        return user;
      })
    const groupInfos = await groups.getInfosFromGroup(group_id).then((res) => res).catch((e) => console.error(e))
      if (typeof groupInfos[0] === 'undefined') return res.status(200).json({
        error: 'Veuillez vérifier l\'ID du groupe renseigné'
      })
    const verifyUser = groupInfos.find(element => element.user_id === userInfos.userId)
    if (!verifyUser) return res.status(200).json({
      error: 'Vous n\'avez pas accès aux infos de ce groupe !'
    })
    const rank = await groups.getRankOfGroup(group_id).then((res) => res)
    if(rank) {
      return res.status(201).json(rank)
    } else {
      return res.status(200).json({
        error: 'Un Problème est survenu.'
      })
    }
  }catch(e){
    return res.status(200).json({
      error: 'Un Problème est survenu.'
    })
  }
  },
};

module.exports = groupController;