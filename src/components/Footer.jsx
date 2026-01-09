const Footer = () => {
   const currentYear = new Date().getFullYear();

   return (
      <footer className='bg-slate-800 text-slate-300 py-4 px-6'>
         <div className='flex flex-col md:flex-row justify-between items-center gap-2'>
            <p className='text-sm'>
               © {currentYear} Homework Ecom. All Rights Reserved.
            </p>
            <p className='text-xs text-slate-400'>
               Built with React & Prisma
            </p>
         </div>
      </footer>
   );
};

export default Footer;
