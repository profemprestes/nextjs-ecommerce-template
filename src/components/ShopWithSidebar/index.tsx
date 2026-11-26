"use client";
import React, { useState, useEffect, useMemo } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import shopData from "../Shop/shopData";
import SingleGridItem from "../Shop/SingleGridItem";
import SingleListItem from "../Shop/SingleListItem";
import { ProductCategory, ProductVersion } from "@/types/product";

const PAGE_SIZE = 12;

const CATEGORY_LABELS: Record<ProductCategory, string> = {
  actuales: "Actuales y Mundial 2026",
  retros: "Retros (1988–2017)",
  uruguay: "La Celeste y Uruguay",
  clubes: "Clubes internacionales",
};

const VERSIONS: ProductVersion[] = ["Jugador", "Fan", "Retro", "A confirmar"];

const ShopWithSidebar = () => {
  const [productStyle, setProductStyle] = useState<"grid" | "list">("grid");
  const [productSidebar, setProductSidebar] = useState(false);
  const [stickyMenu, setStickyMenu] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<
    ProductCategory[]
  >([]);
  const [selectedVersions, setSelectedVersions] = useState<ProductVersion[]>(
    []
  );
  const [onlyImmediate, setOnlyImmediate] = useState(false);
  const [sortBy, setSortBy] = useState<"default" | "az" | "za">("default");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const handleStickyMenu = () => setStickyMenu(window.scrollY >= 80);
    window.addEventListener("scroll", handleStickyMenu);

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      if (target && !target.closest(".sidebar-content")) {
        setProductSidebar(false);
      }
    }

    if (productSidebar) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      window.removeEventListener("scroll", handleStickyMenu);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [productSidebar]);

  const categoryCounts = useMemo(() => {
    const counts: Record<ProductCategory, number> = {
      actuales: 0,
      retros: 0,
      uruguay: 0,
      clubes: 0,
    };
    for (const p of shopData) {
      counts[p.category] += 1;
    }
    return counts;
  }, []);

  const filteredProducts = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    const list = shopData.filter((item) => {
      if (
        selectedCategories.length > 0 &&
        !selectedCategories.includes(item.category)
      ) {
        return false;
      }
      if (
        selectedVersions.length > 0 &&
        !selectedVersions.includes(item.version)
      ) {
        return false;
      }
      if (onlyImmediate && item.modalidad !== "entrega_inmediata") {
        return false;
      }
      if (q) {
        const hay = `${item.title} ${item.team} ${item.dorsal ?? ""} ${
          item.season ?? ""
        }`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    if (sortBy === "az") {
      return [...list].sort((a, b) => a.title.localeCompare(b.title, "es"));
    }
    if (sortBy === "za") {
      return [...list].sort((a, b) => b.title.localeCompare(a.title, "es"));
    }
    return list;
  }, [
    searchTerm,
    selectedCategories,
    selectedVersions,
    onlyImmediate,
    sortBy,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedProducts = filteredProducts.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const toggleCategory = (cat: ProductCategory) => {
    setCurrentPage(1);
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleVersion = (ver: ProductVersion) => {
    setCurrentPage(1);
    setSelectedVersions((prev) =>
      prev.includes(ver) ? prev.filter((v) => v !== ver) : [...prev, ver]
    );
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategories([]);
    setSelectedVersions([]);
    setOnlyImmediate(false);
    setSortBy("default");
    setCurrentPage(1);
  };

  return (
    <>
      <Breadcrumb
        title={"Catálogo de camisetas"}
        pages={["tienda", "/", "catálogo con filtros"]}
      />
      <section className="overflow-hidden relative pb-20 pt-5 lg:pt-20 xl:pt-28 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex gap-7.5">
            {/* <!-- Sidebar Start --> */}
            <div
              className={`sidebar-content fixed xl:z-1 z-9999 left-0 top-0 xl:translate-x-0 xl:static max-w-[310px] xl:max-w-[270px] w-full ease-out duration-200 ${
                productSidebar
                  ? "translate-x-0 bg-white p-5 h-screen overflow-y-auto"
                  : "-translate-x-full"
              }`}
            >
              <button
                onClick={() => setProductSidebar(!productSidebar)}
                aria-label="Abrir filtros"
                className={`xl:hidden absolute -right-12.5 sm:-right-8 flex items-center justify-center w-8 h-8 rounded-md bg-white shadow-1 ${
                  stickyMenu
                    ? "lg:top-20 sm:top-34.5 top-35"
                    : "lg:top-24 sm:top-39 top-37"
                }`}
              >
                <svg
                  className="fill-current"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M10.0068 3.44714C10.3121 3.72703 10.3328 4.20146 10.0529 4.5068L5.70494 9.25H20C20.4142 9.25 20.75 9.58579 20.75 10C20.75 10.4142 20.4142 10.75 20 10.75H4.00002C3.70259 10.75 3.43327 10.5742 3.3135 10.302C3.19374 10.0298 3.24617 9.71246 3.44715 9.49321L8.94715 3.49321C9.22704 3.18787 9.70147 3.16724 10.0068 3.44714Z"
                    fill=""
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M20.6865 13.698C20.5668 13.4258 20.2974 13.25 20 13.25L4.00001 13.25C3.5858 13.25 3.25001 13.5858 3.25001 14C3.25001 14.4142 3.5858 14.75 4.00001 14.75L18.2951 14.75L13.9472 19.4932C13.6673 19.7985 13.6879 20.273 13.9932 20.5529C14.2986 20.8328 14.773 20.8121 15.0529 20.5068L20.5529 14.5068C20.7539 14.2876 20.8063 13.9703 20.6865 13.698Z"
                    fill=""
                  />
                </svg>
              </button>

              <div className="flex flex-col gap-6">
                {/* Header filtros */}
                <div className="bg-white shadow-1 rounded-lg py-4 px-5">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-dark">Filtros</p>
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="text-blue text-custom-sm hover:underline"
                    >
                      Limpiar todo
                    </button>
                  </div>
                </div>

                {/* Buscador */}
                <div className="bg-white shadow-1 rounded-lg p-5">
                  <label
                    htmlFor="catalog-search"
                    className="block font-medium text-dark mb-3"
                  >
                    Buscar modelo
                  </label>
                  <input
                    id="catalog-search"
                    type="search"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Ej. Uruguay, Messi, 1996..."
                    className="w-full rounded-md border border-gray-3 bg-gray-1 px-3.5 py-2 text-custom-sm outline-hidden focus:border-blue"
                  />
                </div>

                {/* Categorías */}
                <div className="bg-white shadow-1 rounded-lg p-5">
                  <p className="font-medium text-dark mb-4">Categorías</p>
                  <div className="flex flex-col gap-3">
                    {(Object.keys(CATEGORY_LABELS) as ProductCategory[]).map(
                      (cat) => {
                        const active = selectedCategories.includes(cat);
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => toggleCategory(cat)}
                            className={`flex items-center justify-between text-left text-custom-sm ease-out duration-200 hover:text-blue ${
                              active ? "text-blue font-medium" : "text-dark"
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <span
                                className={`w-4 h-4 rounded border flex items-center justify-center ${
                                  active
                                    ? "bg-blue border-blue text-white"
                                    : "bg-white border-gray-3"
                                }`}
                              >
                                {active && "✓"}
                              </span>
                              {CATEGORY_LABELS[cat]}
                            </span>
                            <span
                              className={`rounded-full text-custom-xs px-2 py-0.5 ${
                                active
                                  ? "bg-blue text-white"
                                  : "bg-gray-2 text-dark-3"
                              }`}
                            >
                              {categoryCounts[cat]}
                            </span>
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>

                {/* Versión */}
                <div className="bg-white shadow-1 rounded-lg p-5">
                  <p className="font-medium text-dark mb-4">Versión</p>
                  <div className="flex flex-col gap-3">
                    {VERSIONS.map((ver) => {
                      const active = selectedVersions.includes(ver);
                      return (
                        <button
                          key={ver}
                          type="button"
                          onClick={() => toggleVersion(ver)}
                          className={`flex items-center gap-2 text-left text-custom-sm ease-out duration-200 hover:text-blue ${
                            active ? "text-blue font-medium" : "text-dark"
                          }`}
                        >
                          <span
                            className={`w-4 h-4 rounded border flex items-center justify-center ${
                              active
                                ? "bg-blue border-blue text-white"
                                : "bg-white border-gray-3"
                            }`}
                          >
                            {active && "✓"}
                          </span>
                          {ver}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Modalidad */}
                <div className="bg-white shadow-1 rounded-lg p-5">
                  <p className="font-medium text-dark mb-3">Disponibilidad</p>
                  <label className="flex items-center gap-2.5 cursor-pointer text-custom-sm text-dark">
                    <input
                      type="checkbox"
                      checked={onlyImmediate}
                      onChange={(e) => {
                        setOnlyImmediate(e.target.checked);
                        setCurrentPage(1);
                      }}
                    />
                    Solo entrega inmediata
                  </label>
                </div>
              </div>
            </div>
            {/* <!-- Sidebar End --> */}

            {/* <!-- Content Start --> */}
            <div className="xl:max-w-[870px] w-full">
              <div className="rounded-lg bg-white shadow-1 pl-3 pr-2.5 py-2.5 mb-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <select
                      aria-label="Ordenar productos"
                      value={sortBy}
                      onChange={(e) => {
                        setSortBy(
                          e.target.value as "default" | "az" | "za"
                        );
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
                        {paginatedProducts.length} de {filteredProducts.length}
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

              {paginatedProducts.length === 0 ? (
                <div className="bg-white rounded-lg shadow-1 p-10 text-center">
                  <p className="text-dark font-medium mb-3">
                    No encontramos camisetas con esos filtros.
                  </p>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="inline-flex font-medium text-custom-sm text-white bg-blue py-2.5 px-6 rounded-md hover:bg-blue-dark"
                  >
                    Ver todas las camisetas
                  </button>
                </div>
              ) : (
                <div
                  className={`${
                    productStyle === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-7.5 gap-y-9"
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
              )}

              {/* Paginación */}
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
            {/* <!-- Content End --> */}
          </div>
        </div>
      </section>
    </>
  );
};

export default ShopWithSidebar;
