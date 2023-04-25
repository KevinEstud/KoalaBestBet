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

import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from './context/auth';
import { TchatProvider } from './context/tchat';
import App from "./app"

ReactDOM.render(
  <BrowserRouter>
    <AuthProvider>
    <TchatProvider>
      <Routes>
        <Route path="/*" element={<App />} />
      </Routes>
      </TchatProvider>
    </AuthProvider>
  </BrowserRouter>,
  document.getElementById("root")
);
