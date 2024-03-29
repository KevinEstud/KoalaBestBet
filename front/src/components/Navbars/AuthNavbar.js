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
import {
  Box,
  Button,
  Flex,
  HStack,
  Link,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  DocumentIcon,
  RocketIcon
} from "components/Icons/Icons";
import { SidebarAuth } from "components/Sidebar/Sidebar";
import PropTypes from "prop-types";
import React from "react";
import { NavLink } from "react-router-dom";
import routes from "routes";
export default function AuthNavbar(props) {
  let RoutesB = [];
  routes.map((element) => {
    if(element.layout === '/auth' && !element.hidden) {
      RoutesB.push({
            name: element.name,
            path: element.path,
            icon: element.icon,
            layout: element.layout,
            component: element.component,
            rtlName: element.rtlName
           })
          }
  })
  const [open, setOpen] = React.useState(false);
  const handleDrawerToggle = () => {
    setOpen(!open);
  };
  const { logo, logoText, secondary, ...rest } = props;
  // verifies if routeName is the one active (in browser input)
  const activeRoute = (routeName) => {
    return window.location.href.indexOf(routeName) > -1 ? true : false;
  };
  // Chakra color mode
  let navbarIcon = "white";
  let mainText = "white";
  let navbarBg =
    "linear-gradient(123.64deg, rgba(255, 255, 255, 0) -22.38%, rgba(255, 255, 255, 0.039) 70.38%)";
  let navbarBorder = "rgba(226, 232, 240, 0.3)";
  let navbarShadow = useColorModeValue(
    "0px 7px 23px rgba(0, 0, 0, 0.05)",
    "none"
  );
  let navbarFilter = useColorModeValue(
    "none",
    "drop-shadow(0px 7px 23px rgba(0, 0, 0, 0.05))"
  );
  let navbarBackdrop = "blur(42px)";
  let navbarPosition = "fixed";
  var brand = (
    <Link
      href={`${process.env.PUBLIC_URL}/`}
      display='flex'
      lineHeight='100%'
      fontWeight='bold'
      justifyContent='center'
      alignItems='center'
      color={mainText}>
      <Box
        bg='linear-gradient(97.89deg, #FFFFFF 70.67%, rgba(117, 122, 140, 0) 108.55%)'
        bgClip='text'>
        <Text fontSize='sm' letterSpacing='3px' mt='3px' color='transparent'>
          KoalaBestBet
        </Text>
      </Box>
    </Link>
  );
  var linksAuth = (
    <HStack display={{ sm: "none", lg: "flex" }}>
      <NavLink to='/auth/signin'>
        <Button
          fontSize='sm'
          ms='0px'
          px='0px'
          me={{ sm: "2px", md: "16px" }}
          color={navbarIcon}
          variant='transparent-with-icon'
          leftIcon={
            <DocumentIcon color={navbarIcon} w='12px' h='12px' me='0px' />
          }>
          <Text>Me connecter</Text>
        </Button>
      </NavLink>
      <NavLink to='/auth/signup'>
        <Button
          fontSize='sm'
          ms='0px'
          px='0px'
          me={{ sm: "2px", md: "16px" }}
          color={navbarIcon}
          variant='transparent-with-icon'
          leftIcon={
            <RocketIcon color={navbarIcon} w='12px' h='12px' me='0px' />
          }>
          <Text>M'inscrire</Text>
        </Button>
      </NavLink>
    </HStack>
  );
  return (
    <Flex
      position={navbarPosition}
      top='16px'
      left='50%'
      transform='translate(-50%, 0px)'
      background={navbarBg}
      border='2px solid'
      borderColor={navbarBorder}
      boxShadow={navbarShadow}
      filter={navbarFilter}
      backdropFilter={navbarBackdrop}
      borderRadius='20px'
      px='16px'
      py='22px'
      mx='auto'
      width='1044px'
      maxW='90%'
      alignItems='center'>
      <Flex w='100%' justifyContent={{ sm: "start", lg: "space-evenly" }}>
        {brand}
        <Box
          ms={{ base: "auto", lg: "0px" }}
          display={{ base: "flex", lg: "none" }}>
          <SidebarAuth
            iconColor='white'
            logoText={props.logoText}
            secondary={props.secondary}
            routes={RoutesB}
            {...rest}
            />
        </Box>
        {linksAuth}
      </Flex>
    </Flex>
  );
}

AuthNavbar.propTypes = {
  color: PropTypes.oneOf(["primary", "info", "success", "warning", "danger"]),
  brandText: PropTypes.string,
};
