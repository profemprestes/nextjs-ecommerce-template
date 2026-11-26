"use client";
import React, { useMemo, useState } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import SingleGridItem from "../Shop/SingleGridItem";
import SingleListItem from "../Shop/SingleListItem";
import shopData from "../Shop/shopData";

const PAGE_SIZE = 12;

const ShopWithoutSidebar = () => {
  const [productStyle, setProductStyle] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"default" | "az" | "za">("default");
  const [currentPage, setCurrentPage] = useState(1);

  const sortedProducts = useMemo(() => {
    if (sortBy === "az") {
      return [...shopData].sort((a, b) => a.title.localeCompare(b.title, "es"));
    }
    if (sortBy === "za") {
      return [...shopData].sort((a, b) => b.title.localeCompare(a.title, "es"));
    }
    return shopData;
  }, [sortBy]);

  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedProducts = sortedProducts.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  return (
    <>
      <Breadcrumb
        title={"Catálogo completo"}
        pages={["tienda", "/", "catálogo completo"]}
      />
      <section className="overflow-hidden relative pb-20 pt-5 lg:pt-20 xl:pt-28 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="w-full">
            <div className="rounded-lg bg-white shadow-1 pl-3 pr-2.5 py-2.5 mb-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4">
                  <select
                    aria-label="Ordenar productos"
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value as "default" | "az" | "za");
                      setCurrentPage(1);
                    }}
                    className="rounded-md border border-gray-3 bg-gray-1 px-3 py-2 text-custom-sm text-dark outline-hidden"
                  >
                    <option value="default">Orden destacado</option>
                    <option value="az">Nombre: A–Z</option>
                    <option value="za">Nombre: Z–A</option>
                  </select>

                  <p className="text-custom-sm">
                    Mostrando{" "}
                    <span className="text-dark font-medium">
                      {paginatedProducts.length} de {sortedProducts.length}
                    </span>{" "}
                    camisetas
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setProductStyle("grid")}
                    aria-label="Vista en grilla"
                    className={`${
                      productStyle === "grid"
                        ? "bg-blue border-blue text-white"
                        : "text-dark bg-gray-1 border-gray-3"
                    } flex items-center justify-center px-3 h-9 rounded-[5px] border text-custom-xs font-medium ease-out duration-200 hover:bg-blue hover:border-blue hover:text-white`}
                  >
                    Grilla
                  </button>

                  <button
                    onClick={() => setProductStyle("list")}
                    aria-label="Vista en lista"
                    className={`${
                      productStyle === "list"
                        ? "bg-blue border-blue text-white"
                        : "text-dark bg-gray-1 border-gray-3"
                    } flex items-center justify-center px-3 h-9 rounded-[5px] border text-custom-xs font-medium ease-out duration-200 hover:bg-blue hover:border-blue hover:text-white`}
                  >
                    Lista
                  </button>
                </div>
              </div>
            </div>

            <div
              className={`${
                productStyle === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-7.5 gap-y-9"
                  : "flex flex-col gap-7.5"
              }`}
            >
              {paginatedProducts.map((item) =>
                productStyle === "grid" ? (
                  <SingleGridItem item={item} key={item.slug} />
                ) : (
                  <SingleListItem item={item} key={item.slug} />
                )
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center mt-15">
                <div className="bg-white shadow-1 rounded-md p-2">
                  <ul className="flex items-center gap-1">
                    <li>
                      <button
                        type="button"
                        disabled={safePage <= 1}
                        onClick={() => setCurrentPage(safePage - 1)}
                        className="flex items-center justify-center px-3 h-9 rounded-[3px] text-custom-sm text-dark disabled:text-gray-4 hover:bg-gray-2"
                      >
                        Anterior
                      </button>
                    </li>
                    {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(
                      (page) => (
                        <li key={page}>
                          <button
                            type="button"
                            onClick={() => setCurrentPage(page)}
                            className={`flex py-1.5 px-3.5 duration-200 rounded-[3px] text-custom-sm ${
                              page === safePage
                                ? "bg-blue text-white"
                                : "text-dark hover:bg-blue hover:text-white"
                            }`}
                          >
                            {page}
                          </button>
                        </li>
                      )
                    )}
                    <li>
                      <button
                        type="button"
                        disabled={safePage >= totalPages}
                        onClick={() => setCurrentPage(safePage + 1)}
                        className="flex items-center justify-center px-3 h-9 rounded-[3px] text-custom-sm text-dark disabled:text-gray-4 hover:bg-gray-2"
                      >
                        Siguiente
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default ShopWithoutSidebar;
