import Link from "next/link";
import React from "react";

const Breadcrumb = ({ title, pages }) => {
  return (
    <div className="bg-[#FFFFFF] border-b border-black/10 pt-12">
      <div className="container py-5 lg:py-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h1 className="font-semibold text-[#1D1D1F] text-xl sm:text-2xl lg:text-3xl">
            {title}
          </h1>

          <ul className="flex items-center gap-2 text-sm text-[#6E6E73]">
            <li className="hover:text-[#0066CC] transition-colors">
              <Link href="/">Home /</Link>
            </li>

            {pages.length > 0 &&
              pages.map((page, key) => (
                <li className="last:text-[#0066CC] capitalize" key={key}>
                  {page}
                </li>
              ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Breadcrumb;
