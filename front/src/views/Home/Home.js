import React, { useEffect, useState } from "react";
import {Helmet} from "react-helmet"
import useAuth  from "hooks/useAuth"
import useScript from "hooks/useScript";
import useAxiosPrivate from "hooks/useAxiosPrivate";
import {
  Image
} from "@chakra-ui/react";
const Home = () => {
    const { auth } = useAuth();
    const [username, setUsername] = useState()
    const axiosPrivate = useAxiosPrivate();
    useEffect(async () => {
      if(JSON.parse(localStorage.getItem("persist"))) {
        await axiosPrivate.get('/infos/user').then((e) => {
          setUsername(auth?.username)
        })
      }
    }, [auth?.token, auth?.username])
    useScript('./assets/vendor/purecounter/purecounter_vanilla.js')
    useScript('./assets/vendor/aos/aos.js')
    useScript('./assets/vendor/bootstrap/js/bootstrap.bundle.min.js')
    useScript('./assets/vendor/glightbox/js/glightbox.min.js')
    useScript('./assets/vendor/isotope-layout/isotope.pkgd.min.js')
    useScript('./assets/js/main.js')
    return ( 
      <>
      <Helmet>
    <link href="https://fonts.googleapis.com/css?family=Open+Sans:300,300i,400,400i,600,600i,700,700i|Raleway:300,300i,400,400i,500,500i,600,600i,700,700i|Poppins:300,300i,400,400i,500,500i,600,600i,700,700i" rel="stylesheet"/>
    <link href="./assets/vendor/aos/aos.css" rel="stylesheet" />
    <link href="./assets/vendor/bootstrap/css/bootstrap.min.css" rel="stylesheet" />
    <link href="./assets/vendor/bootstrap-icons/bootstrap-icons.css" rel="stylesheet" />
    <link href="./assets/vendor/boxicons/css/boxicons.min.css" rel="stylesheet" />
    <link href="./assets/vendor/glightbox/css/glightbox.min.css" rel="stylesheet" />
    <link href="./assets/vendor/swiper/swiper-bundle.min.css" rel="stylesheet" />
    <link href="./assets/css/style.css" rel="stylesheet" />
      </Helmet>
        <div id="header" class="fixed-top header-transparent">
        <div class="container d-flex align-items-center justify-content-between">

        <div class="logo">
            <h1 class="text-light"><a href="index.html"><span>KoalaBestBet</span></a></h1>
        </div>
        <nav id="navbar" class="navbar">
        <ul>
            <li><a class="nav-link scrollto active" href="#hero">Accueil</a></li>
            <li><a class="nav-link scrollto" href="#services">Concept</a></li>
            <li><a class="nav-link scrollto" href="#team">Équipe</a></li>
        <li class="dropdown"><a href="#"><span>Mon Compte</span> <i class="bi bi-chevron-down"></i></a>
            <ul>
              {!username ? 
              <>
              <li><a href="/auth/signin">Se connecter</a></li>
              <li><a href="/auth/signup">S'inscrire</a></li>
              </>
              :
              <>
              <li><center><Image borderRadius='50%' center boxSize='64px' src={require("images/avatar/" + auth?.avatar_path)} /></center></li>
              <li><a>Bonjour {username} !</a></li>
              <li><a href="/main/dashboard">Vers le site</a></li>
              <li><a href="/main/profile">Mon Compte</a></li>
              <li><a href="/main/logout">Déconnexion</a></li>
              </>
              }
            </ul>
          </li>
        </ul>
        <i class="bi bi-list mobile-nav-toggle"></i>
        </nav>
      </div>
      </div>
      <section id="hero">
      <div class="hero-container" data-aos="fade-up">
      <h1>KoalaBestBet</h1>
      <h2>Venez pronotisquer sur vos équipes favorite en affrontant vos amis ou la communauté KoalaBestBet</h2>
      <a href="#services" class="btn-get-started scrollto"><i class="bx bx-chevrons-down"></i></a>
      </div>
      </section>

      <main id="main">
      <section id="services" class="services">
      <div class="container">
      <div class="col-sm-xl d-flex box-full align-items-stretch xl-10">
        <div class="icon-box" data-aos="fade-up" data-aos-delay="100">
        <center><h4 class="title">Concept</h4></center>
        <center><p class="description">KoalaBestBet est un site ou il vous est possible de pronotisquer avec vos amis, sur vos équipes e-sport favorite.</p></center>
        </div>
        </div>
        <br />
        <div class="row">
          <div class="col-md-6 col-lg-3 d-flex align-items-stretch mb-5 mb-lg-0">
            <div class="icon-box" data-aos="fade-up">
              <div class="icon"><i class="bx bxl-dribbble"></i></div>
              <h4 class="title"><a href="">Créez votre groupe</a></h4>
              <p class="description">Sélectionnez les matchs qui vous intéressent parmis les sports disponible, et invitez vos amis grâce a un code d'invitation, où mettez votre groupe en "Public" afin de pouvoir affronter la communauté.</p>
            </div>
          </div>

          <div class="col-md-6 col-lg-3 d-flex align-items-stretch mb-5 mb-lg-0">
            <div class="icon-box" data-aos="fade-up" data-aos-delay="100">
              <div class="icon"><i class="bx bx-file"></i></div>
              <h4 class="title"><a href="">Pronostiquez</a></h4>
              <p class="description">Choisissez les équipes qui selont vous seront gagnante, parmis les matchs que le leader du groupe a sélectionné.</p>
            </div>
          </div>

          <div class="col-md-6 col-lg-3 d-flex align-items-stretch mb-5 mb-lg-0">
            <div class="icon-box" data-aos="fade-up" data-aos-delay="200">
              <div class="icon"><i class="bx bx-tachometer"></i></div>
              <h4 class="title"><a href="">Gagnez vos Koalacoins</a></h4>
              <p class="description">Patientez jusqu'à ce tous les matchs soient finis afin que le/les vainqueurs du groupe soient désignés, et commencez à gagner vos KoalaCoins.</p>
            </div>
          </div>

          <div class="col-md-6 col-lg-3 d-flex align-items-stretch mb-5 mb-lg-0">
            <div class="icon-box" data-aos="fade-up" data-aos-delay="300">
              <div class="icon"><i class="bx bx-world"></i></div>
              <h4 class="title"><a href="">Classement</a></h4>
              <p class="description">Un classement général est disponible pour tous les utilisateurs, afin de pouvoir devenir le meilleur des pronostiqueurs.</p>
            </div>
          </div>
        </div>

      </div>
    </section>
    <section id="team" class="services team">
      <div class="container">
      <div class="col-sm-xl d-flex box-full align-items-stretch xl-10">
        <div class="icon-box" data-aos="fade-up" data-aos-delay="100">
        <center><h4 class="title">Équipe</h4></center>
        <center><p class="description">Après avoir vécu une première vie en "béta", KoalaBestBet est désormais entièrement géré/mis à jour par moi-même.</p></center>
        </div>
        </div>
        <br />
        <div class="row justify-content-center">
          <div class="col-lg-4 col-md-6">
            <div class="member" data-aos="fade-up" data-aos-delay="150">
              <div class="pic"><img src={require("images/avatar/ava_18.jpg")} class="img-fluid" alt="K" /></div>
              <div class="member-info">
                <h4>Kevin</h4>
                <span>Fullstack Developpeur</span>
                <div class="social">
                  <a href="https://github.com/KevinEstud" target="_blank"><i class="bi bi-github"></i></a>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
    </main>
  <a href="#" id="back-top" class="back-to-top d-flex align-items-center justify-content-center"><i class="bi bi-arrow-up-short"></i></a>
  </>
);

}

export default Home ;