'use client';

import React from 'react';
import AdminSidebar from "../../components/Admin/sidebar/AdminSidebar";
import AdminProtected from '../../hooks/adminProtected';
import DashboardHero from "@/app/components/Admin/DashboardHero";
import EditFaq from "../../components/Admin/Customization/EditFaq";

const Page = () => {
  return (
    <div>
      <AdminProtected>

        <div className='flex h-[200vh]'>

          <div className='1500px:w-[16%] w-1/5'>
            <AdminSidebar />
          </div>

          <div className='w-[85%]'>
            <DashboardHero />
            <EditFaq />
          </div>

        </div>

      </AdminProtected>
    </div>
  );
};

export default Page;