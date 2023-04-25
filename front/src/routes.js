/*!

=========================================================
* Vision UI Free Chakra - v1.0.0
=========================================================

* Product Page: https://www.creative-tim.com/product/vision-ui-free-chakra
* Copyright 2021 Creative Tim (https://www.creative-tim.com/)
* Licensed under MIT (https://github.com/creativetimofficial/vision-ui-free-chakra/blob/master LICENSE.md)

* Design and Coded by Simmmple & Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/

// import
import CreateBet from "views/Dashboard/CreateBet.js";
import Dashboard from "views/Dashboard/Dashboard.js";
import Groups from "views/Dashboard/Groups.js";
import GroupDetails from "views/Dashboard/GroupDetails";
import CreateGroup from "views/Dashboard/CreateGroup.js";
import FindGroup from "views/Dashboard/FindGroup.js";
import Ranking from "views/Dashboard/Ranking";
import ManageUser from "views/Admin/Users.js";
import Messages from "views/Admin/Messages.js";
import Profile from "views/Dashboard/Profile.js";
import Support from "views/Dashboard/Support.js";
import ForgotPassword from "views/Pages/ForgotPassword.js";
import ResetPassword from "views/Pages/ResetPassword.js";
import SignUp from "views/Pages/SignUp.js";
import Logout from "views/Pages/Logout.js";

import { TiGroupOutline, TiPlusOutline, TiZoom, TiPlug, TiGroup, TiMessages } from "react-icons/ti";
import { GiPodium } from "react-icons/gi";

import {
  HomeIcon,
  PersonIcon,
  DocumentIcon,
  SupportIcon,
} from "components/Icons/Icons";
import SignIn from "views/Pages/SignIn";

var dashRoutes = [
  {
    path: "/dashboard",
    name: "Accueil",
    rtlName: "لوحة القيادة",
    icon: <HomeIcon color='inherit' />,
    component: <Dashboard />,
    layout: "/main",
  },
  {
    path: "/my-groups",
    name: "Mes groupes",
    rtlName: "لوحة القيادة",
    icon: <TiGroupOutline color='inherit' />,
    component: <Groups />,
    layout: "/main",
  },
  {
    path: "/create-groupe",
    name: "Créer un groupe",
    rtlName: "لوحة القيادة",
    icon: <TiPlusOutline color='inherit' />,
    component: <CreateGroup />,
    layout: "/main",
  },
  {
    path: "/find-group",
    name: "Trouver un groupe",
    rtlName: "لوحة القيادة",
    icon: <TiZoom color='inherit' />,
    component: <FindGroup />,
    layout: "/main",
  },
  {
    path: "/rank",
    name: "Classement",
    rtlName: "لوحة القيادة",
    icon: <GiPodium color='inherit' />,
    component: <Ranking />,
    layout: "/main",
  },
  {
    path: "/signin",
    name: "Me Connecter",
    rtlName: "لوحة القيادة",
    icon: <DocumentIcon color='inherit' />,
    component: <SignIn />,
    layout: "/auth",
    refer: "Online"
  },
  {
    path: "/signup",
    name: "M'inscrire",
    rtlName: "لوحة القيادة",
    icon: <DocumentIcon color='inherit' />,
    component: <SignUp />,
    layout: "/auth",
    refer: "Online"
  },
  {
    path: "/create-bet/:id",
    component: <CreateBet />,
    layout: "/main",
    hidden: true
  },
  {
    path: "/group/:id",
    component: <GroupDetails />,
    layout: "/main",
    hidden: true
  },
  {
    path: "/forgot-password",
    component: <ForgotPassword />,
    layout: "/auth",
    hidden: true
  },
  {
    path: "/reset-password/:verifyCode",
    component: <ResetPassword />,
    layout: "/auth",
    hidden: true
  },
  {
    path: "/support",
    name: "Support",
    rtlName: "لوحة القيادة",
    icon: <SupportIcon color='inherit' />,
    component: <Support />,
    layout: "/main",
    refer: "NoNeed",
    secondaryNavbar: true
  },
  {
    name: "Mon Compte",
    category: "account",
    rtlName: "صفحات",
    state: "pageCollapse",
    views: [
      {
        path: "/profile",
        name: "Mon Profil",
        rtlName: "لوحة القيادة",
        icon: <PersonIcon color='inherit' />,
        secondaryNavbar: true,
        component: <Profile />,
        layout: "/main",
        refer: "NoNeed"
      },
      {
        name: "Déconnexion",
        path: '/logout',
        rtlName: "لوحة القيادة",
        icon: <TiPlug color='inherit' />,
        secondaryNavbar: true,
        component: <Logout />,
        layout: "/main",
        refer: "NoNeed"
      }
    ],
      },
      {
        name: "Administration",
        category: "admin",
        state: "pageCollapse",
        views: [
          {
            path: "/admin/manage-users",
            name: "Gestion Utilisateurs",
            icon: <TiGroup color='inherit' />,
            secondaryNavbar: true,
            component: <ManageUser />,
            layout: "/main"
          },
          {
            name: "Messages",
            path: '/admin/list-messages',
            icon: <TiMessages color='inherit' />,
            secondaryNavbar: true,
            component: <Messages />,
            layout: "/main"
          }
        ],
          },
];
export default dashRoutes;
