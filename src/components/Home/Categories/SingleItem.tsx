import { Category } from "@/types/category";
import React from "react";
import Image from "next/image";
import Link from "next/link";

const SingleItem = ({ item }: { item: Category }) => {
  return (
    <Link href="/shop-with-sidebar" className="group flex flex-col items-center">
      <div className="w-32.5 h-32.5 bg-[#F2F3F8] rounded-full overflow-hidden flex items-center justify-center mb-4 border border-gray-3">
        <Image
          src={item.img}
          alt={item.title}
          width={130}
          height={130}
          className="w-full h-full object-cover group-hover:scale-105 ease-out duration-300"
        />
      </div>

      <div className="flex justify-center">
        <h3 className="inline-block font-medium text-center text-dark bg-linear-to-r from-blue to-blue bg-size-[0px_1px] bg-bottom-left bg-no-repeat transition-[background-size] duration-500 hover:bg-size-[100%_3px] group-hover:bg-size-[100%_1px] group-hover:text-blue">
          {item.title}
        </h3>
      </div>
    </Link>
  );
};

export default SingleItem;
