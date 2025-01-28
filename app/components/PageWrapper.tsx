'use client'
import { ReactNode } from 'react';

export default function PageWrapper({ children }: { children: ReactNode }) {
    

    return (
        <div className=' flex flex-col w-full  h-full overflow-y-auto'>
            {children}
        </div>
    );
}