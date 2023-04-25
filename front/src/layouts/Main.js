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

// Chakra imports
import { ChakraProvider, Portal, Box, useDisclosure, IconButton, Flex } from "@chakra-ui/react";
import Configurator from "../components/Configurator/Configurator";
import Footer from "../components/Footer/Footer";
import { ChatIcon } from "@chakra-ui/icons";
// Layout components
import AdminNavbar from "../components/Navbars/AdminNavbar.js";
import Sidebar from "../components/Sidebar/Sidebar.js";
import Tchat from "../components/Tchat/Tchat";
import React, { useState } from "react";
import { Navigate, Routes, Route } from "react-router-dom";
import routes from "../routes";
import useAuth from "hooks/useAuth";
// Custom Chakra theme
import theme from "../theme/themeAdmin.js";
import FixedPlugin from "../components/FixedPlugin/FixedPlugin";
// Custom components
import MainPanel from "../components/Layout/MainPanel";
import PanelContainer from "../components/Layout/PanelContainer";
import PanelContent from "../components/Layout/PanelContent";
export default function Dashboard(props) {
  let activeBg = "#1A1F37";
  let inactiveBg = "#1A1F37";
  let activeColor = "white";
  let inactiveColor = "white";
  let sidebarActiveShadow = "none";
  let variantChange = "0.2s linear";
  const { ...rest } = props;
  // states and functions
  const { auth } = useAuth();
  const [sidebarVariant, setSidebarVariant] = useState("transparent");
  const [fixed, setFixed] = useState(false);
  // ref for main panel div
  const mainPanel = React.createRef();
  // functions for changing the states from components
  const getRoute = () => {
    return window.location.pathname !== "/admin/full-screen-maps";
  };
  const getActiveRoute = (routes) => {
    let activeRoute = "Default Brand Text";
    for (let i = 0; i < routes.length; i++) {
      if (routes[i].collapse) {
        let collapseActiveRoute = getActiveRoute(routes[i].views);
        if (collapseActiveRoute !== activeRoute) {
          return collapseActiveRoute;
        }
      } else if (routes[i].category) {
        let categoryActiveRoute = getActiveRoute(routes[i].views);
        if (categoryActiveRoute !== activeRoute) {
          return categoryActiveRoute;
        }
      } else {
        if (
          window.location.href.indexOf(routes[i].layout + routes[i].path) !== -1
        ) {
          return routes[i].name;
        }
      }
    }
    return activeRoute;
  };
  // This changes navbar state(fixed or not)
  const getActiveNavbar = (routes) => {
    let activeNavbar = false;
    for (let i = 0; i < routes.length; i++) {
      if (routes[i].category) {
        let categoryActiveNavbar = getActiveNavbar(routes[i].views);
        if (categoryActiveNavbar !== activeNavbar) {
          return categoryActiveNavbar;
        }
      } else {
        if (
          window.location.href.indexOf(routes[i].layout + routes[i].path) !== -1
        ) {
          if (routes[i].secondaryNavbar) {
            return routes[i].secondaryNavbar;
          }
        }
      }
    }
    return activeNavbar;
  };
  const getRoutes = (routes) => {
   return routes.map((prop, key) => {
    if (prop.hidden) {
      return (
        <Route
          path={prop.path}
          element={prop.component}
          key={key}
        />
      )
    }
    if(prop.category === 'admin' && auth?.isadmin) {
        return getRoutes(prop.views)
      }
      if(prop.category === 'account') {
        return getRoutes(prop.views);
      }
      if(prop.category === 'admin' && auth?.isadmin) {
        return getRoutes(prop.views)
      }
      if (prop.refer !== "Online") {
        return (
          <Route
            path={prop.path}
            element={prop.component}
            key={key}
          />
        )
      }
      else {
        return null;
      }
    });
    
  };
  const { isOpen, onOpen, onClose } = useDisclosure();
 
  document.documentElement.dir = "ltr";
  // Chakra Color Mode
  return (
      <ChakraProvider theme={theme} resetCss={false}>
        <Sidebar
          routes={routes}
          logoText='KoalaBestBet'
          display='none'
          sidebarVariant={sidebarVariant}
          {...rest}> 
            </Sidebar>
           <Tchat />
          <MainPanel
          ref={mainPanel}
          w={{
            base: "100%",
            xl: "calc(100% - 275px)",
          }}>
          <Portal>
            <AdminNavbar
             
              {...rest}
            />
          </Portal>
          {getRoute() ? (
            <PanelContent>
              <PanelContainer>
                <Routes>
                  {getRoutes(routes)}
                  <Route path="*" element={<Navigate to="/main/dashboard"/>} />
                </Routes>
              </PanelContainer>
            </PanelContent>
          ) : null}
          <Footer />
          <Portal>
            <FixedPlugin
              secondary={getActiveNavbar(routes)}
              fixed={fixed}
              onOpen={onOpen}
            />
          </Portal>
          <Configurator
            secondary={getActiveNavbar(routes)}
            isOpen={isOpen}
            onClose={onClose}
            isChecked={fixed}
            onSwitch={(value) => {
              setFixed(value);
            }}
            onOpaque={() => setSidebarVariant("opaque")}
            onTransparent={() => setSidebarVariant("transparent")}
          />
        </MainPanel>
      </ChakraProvider>
    );
    }
