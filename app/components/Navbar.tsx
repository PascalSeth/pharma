import { LoginLink } from "@kinde-oss/kinde-auth-nextjs/components";

type User = {
  picture?: string | null;  // Allow `null` here
  given_name: string | null; // Allow `null` here
  family_name: string | null; // Allow `null` here
};
type NavbarProps = {
  user: User ;

};

async function Navbar({ user }: NavbarProps) {


  return (
    <nav className="flex w-full   items-center bg-white shadow-md p-4">
      <div className=' justify-between max-lg:hidden w-full flex'>
      {/* Logo Section */}
      <div className='flex flex-col'>
      <div className="text-lg font-semibold">Apotek Pelita Sehat</div>
      
      {/* Date */}
      <div className="text-gray-500 text-sm">Tuesday, 13 June 2023</div>
      </div>
      {/* Search and Buttons */}
      <div className="flex items-center space-x-4">
      
       
        

</div>
        {/* User Info */}
        {user ? (<>        <div className="flex items-center space-x-2">
               {/* Notifications */}
               <div className="relative items-center">
          <button className="text-gray-600 hover:text-gray-800">
            🔔
          </button>
          {/* Notification Badge */}
          <span className="absolute top-0 -mt-2 -mr-1 right-0 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">1</span>
        </div>   
        <img
            src="https://via.placeholder.com/32"
            alt="User profile"
            className="w-8 h-8 rounded-full"
          />
          <div>
            <div className="text-sm font-semibold">Mohammad Naufal</div>
            <div className="text-xs text-gray-500">Pharmacist</div>
          </div>
        </div>
        </>
):(<>
<LoginLink>Login</LoginLink>
</>)}</div>
{/* Mobile Navbar */}
        <div className='flex w-full lg:hidden justify-between'>
 {/* Logo Section */}
 <div className='flex flex-col'>
      <div className="text-lg font-semibold">Apotek Pelita Sehat</div>
      
      {/* Date */}
      <div className="text-gray-500 text-sm">Tuesday, 13 June 2023</div>
      </div>
      
        {/* User Info */}
        <div className="flex items-center space-x-2">
          <img
            src="https://via.placeholder.com/32"
            alt="User profile"
            className="w-8 h-8 rounded-full"
          />
    
        </div>
        </div>
      
    </nav>
  );
}

export default Navbar;
