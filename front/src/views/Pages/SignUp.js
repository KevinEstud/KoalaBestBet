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

import React, {useState, useRef, useEffect} from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa"
import ReCAPTCHA from "react-google-recaptcha";
// Chakra imports
import {
  Alert,
  AlertIcon,
  Box,
  Flex,
  Button,
  FormControl,
  FormLabel,
  HStack,
  Input,
  InputGroup,
  InputRightElement,
  Switch,
  Text,
  Icon,
  DarkMode,
} from "@chakra-ui/react";
// import {
//   requestSignup
// } from 'api/index';
import axios from 'api/index';
// Custom Components
import AuthFooter from "components/Footer/AuthFooter";
import GradientBorder from "components/GradientBorder/GradientBorder";

// Assets
import signInImage from "assets/img/signInImage.png";

function SignUp() {
  const [success, setSuccess] = useState();
  const [error, setError] = useState();
  const [show, setShow] = useState(false);
  const [show1, setShow1] = useState(false);
  const navigate = useNavigate();
  const handleClick1 = () => setShow1(!show1)
  const handleClick = () => setShow(!show)
  const recaptchaRef = useRef(null)
  const [credentials, setCredentials] = useState({
    username: "",
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    passwordconfirm: ""
  })
  function isValidEmail(email) {
    return /\S+@\S+\.\S+/.test(email);
  }
  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };
  useEffect(() => {
    document.title = "KoalaBestBet - Inscription"
  }, [])
  const onSubmit = async (e) =>  { 
    e.preventDefault();
    if(!credentials.email || !credentials.password || !credentials.passwordconfirm || !credentials.username || !credentials.firstname || !credentials.lastname) {
            setSuccess(false)
     return setError('Veuillez vérifier et renseigner tout les champs.')
    }
    if(!isValidEmail(credentials.email) && credentials.username && credentials.password && credentials.passwordconfirm && credentials.firstname && credentials.lastname) {
             setSuccess(false) 
      return setError('veuillez vérifier le mail saisis.')
    }
    if(credentials.password?.length <= 6) {
            setSuccess(false)
     return setError('Votre mot de passe doit faire plus de 6 caractères.')
    }
    if(credentials.password !== credentials.passwordconfirm) {
      setSuccess(false)
      return setError('Vos deux mot de passe ne correspondent pas.')
      } else {
        setError(false)
        const captchaToken = await recaptchaRef.current.executeAsync();
        recaptchaRef.current.reset();
        await axios.put('/signup-action', {username:credentials.username, firstname:credentials.firstname, lastname:credentials.lastname, email: credentials.email, password: credentials.password, passwordconfirm: credentials.passwordconfirm, recaptcha: captchaToken}).then((e) => {
            if(e.status === 201) {
                    setError(false)
                    setSuccess('Inscription réussie. Vous allez être redirigé vers la page de connexion.')
                    return setTimeout(() => {
                        navigate('/auth/signin', { replace: true })
                    }, 2500) }
              else if(e.status === 200){    
                     setCredentials(prev => {
                      return {
                          ...prev,
                          password: "", 
                          passwordconfirm: ""
                        }
                      });
                     setSuccess(false)
              return setError(e.data.error)
            }
            else {
              setCredentials({username: "", firstname:"", lastname: "", email: "", password: "", passwordconfirm: ""})
              setSuccess(false)
              return setError("Un Problème est survenu.")
            }
        })
      }
}
  const titleColor = "white";
  const textColor = "gray.400";

  return (
    <Flex position='relative' overflow={{ lg: "hidden" }}>
      <meta http-equiv="X-Frame-Options" content="deny" />
      <Flex
        flexDirection='column'
        h={{ sm: "initial", md: "100%" }}
        w={{ base: "90%" }}
        maxW='1044px'
        mx='auto'
        justifyContent='space-between'
        pt={{ sm: "100px", md: "0px" }}
        me={{ base: "auto", lg: "50px", xl: "auto" }}>
        <Flex
          alignItems='center'
          justifyContent='start'
          style={{ userSelect: "none" }}
          flexDirection='column'
          mx={{ base: "auto", lg: "unset" }}
          ms={{ base: "auto", lg: "auto" }}
          mb='50px'
          w={{ base: "100%", md: "50%", lg: "42%" }}>
          <Flex
            direction='column'
            textAlign='center'
            justifyContent='center'
            align='center'
            mt={{ base: "60px", md: "140px", lg: "200px" }}
            mb='50px'>
          </Flex>
          <GradientBorder p='2px' me={{ base: "none", lg: "30px", xl: "none" }}>
            <Flex
              background='transparent'
              borderRadius='30px'
              direction='column'
              p='40px'
              minW={{ base: "unset", md: "430px", xl: "450px" }}
              w='100%'
              mx={{ base: "0px" }}
              bg={{
                base: "rgb(19,21,56)",
              }}>
              <Text
                fontSize='xl'
                color={textColor}
                fontWeight='bold'
                textAlign='center'
                mb='22px'>
                M'inscrire
              </Text>
              {/* <HStack spacing='15px' justify='center' mb='22px'> */}
                {/* <GradientBorder borderRadius='15px'>
                  <Flex
                    _hover={{ filter: "brightness(120%)" }}
                    transition='all .25s ease'
                    cursor='pointer'
                    justify='center'
                    align='center'
                    bg='rgb(19,21,54)'
                    w='71px'
                    h='71px'
                    borderRadius='15px'>
                    <Link href='#'>
                      <Icon
                        color={titleColor}
                        as={FaFacebook}
                        w='30px'
                        h='30px'
                        _hover={{ filter: "brightness(120%)" }}
                      />
                    </Link>
                  </Flex>
                </GradientBorder>
                <GradientBorder borderRadius='15px'>
                  <Flex
                    _hover={{ filter: "brightness(120%)" }}
                    transition='all .25s ease'
                    cursor='pointer'
                    justify='center'
                    align='center'
                    bg='rgb(19,21,54)'
                    w='71px'
                    h='71px'
                    borderRadius='15px'>
                    <Link href='#'>
                      <Icon
                        color={titleColor}
                        as={FaApple}
                        w='30px'
                        h='30px'
                        _hover={{ filter: "brightness(120%)" }}
                      />
                    </Link>
                  </Flex>
                </GradientBorder>
                <GradientBorder borderRadius='15px'>
                  <Flex
                    _hover={{ filter: "brightness(120%)" }}
                    transition='all .25s ease'
                    cursor='pointer'
                    justify='center'
                    align='center'
                    bg='rgb(19,21,54)'
                    w='71px'
                    h='71px'
                    borderRadius='15px'>
                    <Link href='#'>
                      <Icon
                        color={titleColor}
                        as={FaGoogle}
                        w='30px'
                        h='30px'
                        _hover={{ filter: "brightness(120%)" }}
                      />
                    </Link>
                  </Flex>
                </GradientBorder> */}
              {/* </HStack>
              <Text
                fontSize='lg'
                color='gray.400'
                fontWeight='bold'
                textAlign='center'
                mb='22px'>
                or
              </Text> */}
              {success &&
              <Alert status='success' borderRadius='12px'justifyContent='center' m='.2em'>
              <AlertIcon />{success}</Alert>
              }
              {error &&
              <Alert status='error' borderRadius='12px'justifyContent='center' m='.2em'>
              <AlertIcon />{error}</Alert>
              }
              <form onSubmit={onSubmit}>
              <FormControl>
              <FormLabel
                  color={titleColor}
                  ms='4px'
                  fontSize='sm'
                  fontWeight='normal'>
                  Pseudo
                </FormLabel>

                <GradientBorder
                  mb='24px'
                  h='50px'
                  w={{ base: "100%", lg: "fit-content" }}
                  borderRadius='20px'>
                  <Input
                    color={titleColor}
                    bg={{
                      base: "rgb(19,21,54)",
                    }}
                    border='transparent'
                    borderRadius='20px'
                    fontSize='sm'
                    size='lg'
                    value={credentials.username}
                    name="username"
                    onChange={onChange}
                    w={{ base: "100%", md: "346px" }}
                    maxW='100%'
                    h='46px'
                    type='text'
                    placeholder='Votre pseudo'
                  />
                </GradientBorder>
                <FormLabel
                  color={titleColor}
                  ms='4px'
                  fontSize='sm'
                  fontWeight='normal'>
                  Prénom
                </FormLabel>

                <GradientBorder
                  mb='24px'
                  h='50px'
                  w={{ base: "100%", lg: "fit-content" }}
                  borderRadius='20px'>
                  <Input
                    color={titleColor}
                    bg={{
                      base: "rgb(19,21,54)",
                    }}
                    border='transparent'
                    borderRadius='20px'
                    fontSize='sm'
                    size='lg'
                    value={credentials.firstname}
                    name="firstname"
                    onChange={onChange}
                    w={{ base: "100%", md: "346px" }}
                    maxW='100%'
                    h='46px'
                    type='text'
                    placeholder='Votre prénom'
                  />
                </GradientBorder>
                <FormLabel
                  color={titleColor}
                  ms='4px'
                  fontSize='sm'
                  fontWeight='normal'>
                  Nom
                </FormLabel>

                <GradientBorder
                  mb='24px'
                  h='50px'
                  w={{ base: "100%", lg: "fit-content" }}
                  borderRadius='20px'>
                  <Input
                    color={titleColor}
                    bg={{
                      base: "rgb(19,21,54)",
                    }}
                    border='transparent'
                    borderRadius='20px'
                    fontSize='sm'
                    size='lg'
                    w={{ base: "100%", md: "346px" }}
                    maxW='100%'
                    h='46px'
                    type='text'
                    value={credentials.lastname}
                    name="lastname"
                    onChange={onChange}
                    placeholder='Votre nom de famille'
                  />
                </GradientBorder>
                <FormLabel
                  color={titleColor}
                  ms='4px'
                  fontSize='sm'
                  fontWeight='normal'>
                  Email
                </FormLabel>
                <GradientBorder
                  mb='24px'
                  h='50px'
                  w={{ base: "100%", lg: "fit-content" }}
                  borderRadius='20px'>
                  <Input
                    color={titleColor}
                    bg={{
                      base: "rgb(19,21,54)",
                    }}
                    border='transparent'
                    borderRadius='20px'
                    fontSize='sm'
                    size='lg'
                    w={{ base: "100%", md: "346px" }}
                    maxW='100%'
                    h='46px'
                    value={credentials.email}
                    name="email"
                    onChange={onChange}
                    type='email'
                    placeholder='Votre e-mail'
                  />
                </GradientBorder>
                <FormLabel
                  color={titleColor}
                  ms='4px'
                  fontSize='sm'
                  fontWeight='normal'>
                  Votre mot de passe
                </FormLabel>
                <GradientBorder
                  mb='24px'
                  h='50px'
                  w={{ base: "100%", lg: "fit-content" }}
                  borderRadius='20px'>
                   <InputGroup size='md'>
                   <Input
                    color={titleColor}
                    bg={{
                      base: "rgb(19,21,54)",
                    }}
                    border='transparent'
                    borderRadius='20px'
                    fontSize='sm'
                    size='lg'
                    w={{ base: "100%", md: "346px" }}
                    maxW='100%'
                    h='46px'
                    value={credentials.password}
                    name="password"
                    onChange={onChange}
                    type={show ? 'text' : 'password'}
                    placeholder='Votre mot de passe'
                  />
                    <InputRightElement width='4.5rem'>
                    <Button h='1.75rem' size='sm' onClick={handleClick}>
                    {show ? <FaEye /> : <FaEyeSlash />}
                    </Button>
                     </InputRightElement>
                  </InputGroup>
                </GradientBorder>
                <FormLabel
                  color={titleColor}
                  ms='4px'
                  fontSize='sm'
                  fontWeight='normal'>
                  Confirmation du mot de passe
                </FormLabel>
                <GradientBorder
                  mb='24px'
                  h='50px'
                  w={{ base: "100%", lg: "fit-content" }}
                  borderRadius='20px'>
                  <InputGroup size='md'>
                  <Input
                    color={titleColor}
                    bg={{
                      base: "rgb(19,21,54)",
                    }}
                    border='transparent'
                    borderRadius='20px'
                    fontSize='sm'
                    size='lg'
                    value={credentials.passwordconfirm}
                    name="passwordconfirm"
                    onChange={onChange}
                    w={{ base: "100%", md: "346px" }}
                    maxW='100%'
                    h='46px'
                    type={show1 ? 'text' : 'password'}
                    placeholder='Confirmation du mot de passe'
                  />
                    <InputRightElement width='4.5rem'>
                    <Button h='1.75rem' size='sm' onClick={handleClick1}>
                    {show1 ? <FaEye /> : <FaEyeSlash />}
                    </Button>
                     </InputRightElement>
                  </InputGroup>
                </GradientBorder>
                <Button
                  variant='brand'
                  fontSize='10px'
                  type='submit'
                  w='100%'
                  maxW='350px'
                  h='45'
                  mb='20px'
                  mt='20px'>
                  S'inscrire
                </Button>
                <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={process.env.REACT_APP_RECAPTCHA_KEY}
                size="invisible"
                />
              </FormControl>
              </form>
              <Flex
                flexDirection='column'
                justifyContent='center'
                alignItems='center'
                maxW='100%'
                mt='0px'>
                <Text color={textColor} fontWeight='medium'>
                  Vous avez déjà un compte ?
                  <Link
                    style={{textDecoration: 'none',color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center'}}
                    as='span'
                    ms='5px'
                    to='/auth/signin'
                    fontWeight='bold'>
                     &ensp;Me connecter
                  </Link>
                </Text>
              </Flex>
            </Flex>
          </GradientBorder>
        </Flex>
        <Box
          w={{ base: "335px", md: "450px" }}
          mx={{ base: "auto", lg: "unset" }}
          ms={{ base: "auto", lg: "auto" }}
          mb='90px'>
          <AuthFooter />
        </Box>
        <Box
          display={{ base: "none", lg: "block" }}
          overflowX='hidden'
          h='1300px'
          maxW={{ md: "50vw", lg: "48vw" }}
          w='960px'
          position='absolute'
          left='0px'>
          <Box
            bgImage={signInImage}
            w='100%'
            h='1300px'
            bgSize='cover'
            bgPosition='50%'
            position='absolute'
            display='flex'
            flexDirection='column'
            justifyContent='center'
            alignItems='center'>
            <Text
              textAlign='center'
              color='white'
              letterSpacing='8px'
              fontSize='20px'
              fontWeight='500'>
              KoalaBestBet:
            </Text>
            <Text
              textAlign='center'
              color='transparent'
              letterSpacing='8px'
              fontSize='36px'
              fontWeight='bold'
              bgClip='text !important'
              bg='linear-gradient(94.56deg, #FFFFFF 79.99%, #21242F 102.65%)'>
              Vous aussi venez vous mesurer à vos amis et à la communauté de KoalaBestBet
            </Text>
          </Box>
        </Box>
      </Flex>
    </Flex>
  );
}

export default SignUp;
