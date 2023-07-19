import React from 'react';
import Navbar from '../Navbar/Navbar';

const Layout: React.FC = ({ children }: any) => {
   return (
      <>
         <Navbar />
         {children}
      </>
   );
};
export default Layout;