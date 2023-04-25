require('dotenv').config();
const fetch = require('node-fetch');
const options = {
  method: 'GET',
  headers: {
    Accept: 'application/json',
    Authorization: `Bearer ${process.env.PANDA_KEY}`
  }
};
const matchController = {
  getMatchsUpcoming: async(req, res) => {
    try {

      let infosOfMatchCSGO = [];
      let infosOfMatchLOL = [];
      let infosOfMatchValorant = [];
      await fetch(`https://api.pandascore.co/csgo/matches/upcoming?sort=begin_at&page=1&per_page=100`, options)
      .then(response => {
        return response.json()
      })
      .then(response => {
        response.filter((element) => {
          if(element.opponents.length === 2) {
                    let utcDate = new Date(element.scheduled_at);
                    let myLocalDate = new Date(Date.UTC(
                      utcDate.getFullYear(),
                      utcDate.getMonth(),
                      utcDate.getDate(),
                      utcDate.getHours() + 2,
                      utcDate.getMinutes()
                    ));
                    if(myLocalDate.getFullYear() >= new Date().getFullYear()) {
                    infosOfMatchCSGO.push({
                      id: element.id,
                      match_begin_at: myLocalDate.toLocaleString("fr"),
                      match_name: element.name,
                      live_twitch: element.live_embed_url,
                      team1_name: element.opponents[0].opponent.name,
                      team1_logo: element.opponents[0].opponent.image_url??'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Question_mark_alternate.svg/langfr-90px-Question_mark_alternate.svg.png',
                      team2_name: element.opponents[1].opponent.name,
                      team2_logo: element.opponents[1].opponent.image_url??'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Question_mark_alternate.svg/langfr-90px-Question_mark_alternate.svg.png'
                    })
                  }
          }
        })
      })
      .catch(err => console.error(err))
      
      await fetch(`https://api.pandascore.co/valorant/matches/upcoming?sort=begin_at&page=1&per_page=100`, options)
      .then(response => {
        return response.json()
      })
      .then(response => {
        response.filter((element) => {
          if(element.opponents.length === 2) {
                    let utcDate = new Date(element.scheduled_at);
                    let myLocalDate = new Date(Date.UTC(
                      utcDate.getFullYear(),
                      utcDate.getMonth(),
                      utcDate.getDate(),
                      utcDate.getHours() + 2, 
                      utcDate.getMinutes()
                    ));
                    if(myLocalDate.getFullYear() >= new Date().getFullYear()) {
                    infosOfMatchValorant.push({
                      id: element.id,
                      match_begin_at: myLocalDate.toLocaleString("fr"),
                      match_name: element.name,
                      live_twitch: element.live_embed_url,
                      team1_name: element.opponents[0].opponent.name,
                      team1_logo: element.opponents[0].opponent.image_url??'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Question_mark_alternate.svg/langfr-90px-Question_mark_alternate.svg.png',
                      team2_name: element.opponents[1].opponent.name,
                      team2_logo: element.opponents[1].opponent.image_url??'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Question_mark_alternate.svg/langfr-90px-Question_mark_alternate.svg.png'
                    })
                  }
          }
        })}).catch(err => console.error(err));
        await fetch(`https://api.pandascore.co/lol/matches/upcoming?sort=begin_at&page=1&per_page=100`, options)
        .then(response => {
          return response.json()
        })
        .then(response => {
          response.filter((element) => {
            if(element.opponents.length === 2) {
                      let utcDate = new Date(element.scheduled_at);
                      let myLocalDate = new Date(Date.UTC(
                        utcDate.getFullYear(),
                        utcDate.getMonth(),
                        utcDate.getDate(),
                        utcDate.getHours() + 2,
                        utcDate.getMinutes()
                      ));
                      if(myLocalDate.getFullYear() >= new Date().getFullYear()) {
                      infosOfMatchLOL.push({
                        id: element.id,
                        match_begin_at: myLocalDate.toLocaleString("fr"),
                        match_name: element.name,
                        live_twitch: element.live_embed_url,
                        team1_name: element.opponents[0].opponent.name,
                        team1_logo: element.opponents[0].opponent.image_url??'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Question_mark_alternate.svg/langfr-90px-Question_mark_alternate.svg.png',
                        team2_name: element.opponents[1].opponent.name,
                        team2_logo: element.opponents[1].opponent.image_url??'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Question_mark_alternate.svg/langfr-90px-Question_mark_alternate.svg.png'
                      })
                    }
            }
          })}).catch(err => console.error(err));
      let upcoming = [{
          infosOfMatchCSGO,
          infosOfMatchLOL,
          infosOfMatchValorant
      }];
    return res.status(201).json(upcoming)
}catch(e) {
  return res.status(200).json({
    error: "Un problème est survenu !"
  })
}
},
getMatchsOfAllGame: async(req, res) => {
  try {
    let infosOfMatchCSGOUpcoming = [];
    let infosOfMatchLOLUpcoming = [];
    let infosOfMatchValorantUpcoming = [];
    let infosOfMatchCSGOLive = [];
    let infosOfMatchLOLLive = [];
    let infosOfMatchValorantLive = [];
    await fetch(`https://api.pandascore.co/csgo/matches/upcoming?sort=&page=1&per_page=100`, options)
    .then(response => {
      return response.json()
    })
    .then(response => {
      response.filter((element) => {
        if(element.opponents.length === 2) {
                  let dataDate = element.scheduled_at
                  let utcDate = new Date(dataDate);
                  let myLocalDate = new Date(Date.UTC(
                    utcDate.getFullYear(),
                    utcDate.getMonth(),
                    utcDate.getDate(),
                    utcDate.getHours() + 2,
                    utcDate.getMinutes()
                  ));
                  if(myLocalDate.getFullYear() >= new Date().getFullYear()) {
                  infosOfMatchCSGOUpcoming.push({
                    id: element.id,
                    league: element.league.name,
                    match_begin_at: myLocalDate.toLocaleString("fr"),
                    match_name: element.name,
                    live_twitch: element.live_embed_url,
                    team1_name: element.opponents[0].opponent.name,
                    team1_logo: element.opponents[0].opponent.image_url??'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Question_mark_alternate.svg/langfr-90px-Question_mark_alternate.svg.png',
                    team2_name: element.opponents[1].opponent.name,
                    team2_logo: element.opponents[1].opponent.image_url??'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Question_mark_alternate.svg/langfr-90px-Question_mark_alternate.svg.png'
                  })
                }
        }
      })
    })
    .catch(err => console.error(err))
    //Match en Direct sur CSGO
    await fetch(`https://api.pandascore.co/csgo/matches/running?sort=&page=1&per_page=100`, options)
    .then(response => {
      return response.json()
    })
    .then(response => {
      response.filter((element) => {
        if(element.opponents.length === 2) {
                  infosOfMatchCSGOLive.push({
                    id: element.id,
                    league: element.league.name,
                    match_name: element.name,
                    matchos_id: null,
                    live_twitch: element.live_embed_url,
                    team1_name: element.opponents[0].opponent.name,
                    team1_logo: element.opponents[0].opponent.image_url??'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Question_mark_alternate.svg/langfr-90px-Question_mark_alternate.svg.png',
                    team1_score: element.results[0].score,
                    team2_name: element.opponents[1].opponent.name,
                    team2_score: element.results[1].score,
                    team2_logo: element.opponents[1].opponent.image_url??'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Question_mark_alternate.svg/langfr-90px-Question_mark_alternate.svg.png'
                  })
        }
      })}).catch(err => console.error(err));
    //Match A venir Valorant
    await fetch(`https://api.pandascore.co/valorant/matches/upcoming?sort=&page=1&per_page=100`, options)
    .then(response => {
      return response.json()
    })
    .then(response => {
      response.filter((element) => {
        if(element.opponents.length === 2) {
                  let utcDate = new Date(element.scheduled_at);
                  let myLocalDate = new Date(Date.UTC(
                    utcDate.getFullYear(),
                    utcDate.getMonth(),
                    utcDate.getDate(),
                    utcDate.getHours() + 2,
                    utcDate.getMinutes()
                  ));
                  if(myLocalDate.getFullYear() >= new Date().getFullYear()) {
                  infosOfMatchValorantUpcoming.push({
                    id: element.id,
                    league: element.league.name,
                    match_begin_at: myLocalDate.toLocaleString("fr"),
                    matchos_id: null,
                    match_name: element.name,
                    live_twitch: element.live_embed_url,
                    team1_name: element.opponents[0].opponent.name,
                    team1_logo: element.opponents[0].opponent.image_url??'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Question_mark_alternate.svg/langfr-90px-Question_mark_alternate.svg.png',
                    team2_name: element.opponents[1].opponent.name,
                    team2_logo: element.opponents[1].opponent.image_url??'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Question_mark_alternate.svg/langfr-90px-Question_mark_alternate.svg.png'
                  })
                }
        }
      })}).catch(err => console.error(err));
      //Match en Direct sur Valorant
      await fetch(`https://api.pandascore.co/valorant/matches/running?sort=&page=1&per_page=100`, options)
      .then(response => {
        return response.json()
      })
      .then(response => {
        response.filter((element) => {
          if(element.opponents.length === 2) {
                    infosOfMatchValorantLive.push({
                      id: element.id,
                      league: element.league.name,
                      match_name: element.name,
                      matchos_id: null,
                      live_twitch: element.live_embed_url,
                      team1_name: element.opponents[0].opponent.name,
                      team1_logo: element.opponents[0].opponent.image_url??'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Question_mark_alternate.svg/langfr-90px-Question_mark_alternate.svg.png',
                      team1_score: element.results[0].score,
                      team2_name: element.opponents[1].opponent.name,
                      team2_score: element.results[1].score,
                      team2_logo: element.opponents[1].opponent.image_url??'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Question_mark_alternate.svg/langfr-90px-Question_mark_alternate.svg.png'
                    })
          }
        })}).catch(err => console.error(err));
      //Match a venir sur LOL
      await fetch(`https://api.pandascore.co/lol/matches/upcoming?sort=&page=1&per_page=100`, options)
      .then(response => {
        return response.json()
      })
      .then(response => {
        response.filter((element) => {
          if(element.opponents.length === 2) {
                    let utcDate = new Date(element.scheduled_at);
                    let myLocalDate = new Date(Date.UTC(
                      utcDate.getFullYear(),
                      utcDate.getMonth(),
                      utcDate.getDate(),
                      utcDate.getHours() + 2,
                      utcDate.getMinutes()
                    ));
                    if(myLocalDate.getFullYear() >= new Date().getFullYear()) {
                    infosOfMatchLOLUpcoming.push({
                      id: element.id,
                      league: element.league.name,
                      match_begin_at: myLocalDate.toLocaleString("fr"),
                      matchos_id: null,
                      match_name: element.name,
                      live_twitch: element.live_embed_url,
                      team1_name: element.opponents[0].opponent.name,
                      team1_logo: element.opponents[0].opponent.image_url??'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Question_mark_alternate.svg/langfr-90px-Question_mark_alternate.svg.png',
                      team2_name: element.opponents[1].opponent.name,
                      team2_logo: element.opponents[1].opponent.image_url??'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Question_mark_alternate.svg/langfr-90px-Question_mark_alternate.svg.png'
                    })
                  }
          }
        })}).catch(err => console.error(err));

        //Match en Direct sur LOL
        await fetch(`https://api.pandascore.co/lol/matches/running?sort=&page=1&per_page=100`, options)
      .then(response => {
        return response.json()
      })
      .then(response => {
        response.filter((element) => {
          if(element.opponents.length === 2) {
                    infosOfMatchLOLLive.push({
                      id: element.id,
                      league: element.league.name,
                      match_name: element.name,
                      live_twitch: element.live_embed_url,
                      team1_name: element.opponents[0].opponent.name,
                      team1_logo: element.opponents[0].opponent.image_url??'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Question_mark_alternate.svg/langfr-90px-Question_mark_alternate.svg.png',
                      team1_score: element.results[0].score,
                      team2_name: element.opponents[1].opponent.name,
                      team2_score: element.results[1].score,
                      team2_logo: element.opponents[1].opponent.image_url??'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Question_mark_alternate.svg/langfr-90px-Question_mark_alternate.svg.png'
                    })
          }
        })}).catch(err => console.error(err));
let Valorant = {
      Live:infosOfMatchValorantLive,
      Upcoming:infosOfMatchValorantUpcoming
  }
let CSGO = {
    Live:infosOfMatchCSGOLive,
    Upcoming:infosOfMatchCSGOUpcoming
}
let LOL = {
  Live:infosOfMatchLOLLive,
  Upcoming:infosOfMatchLOLUpcoming
}
let allMatchs = [ {
  CSGO:CSGO, Valorant:Valorant, LOL:LOL
}
];  
  return res.status(201).json(allMatchs)
}catch(e) {
  return res.status(200).json({error: 'Un problème est survenu.'})
}
}
};

module.exports = matchController;
