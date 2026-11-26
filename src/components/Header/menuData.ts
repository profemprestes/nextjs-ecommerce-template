import { Menu } from "@/types/Menu";

export const menuData: Menu[] = [
  {
    id: 1,
    title: "Inicio",
    newTab: false,
    path: "/",
  },
  {
    id: 2,
    title: "Catálogo",
    newTab: false,
    path: "/shop-with-sidebar",
  },
  {
    id: 3,
    title: "Contacto",
    newTab: false,
    path: "/contact",
  },
  {
    id: 6,
    title: "Tienda",
    newTab: false,
    path: "/shop-with-sidebar",
    submenu: [
      {
        id: 61,
        title: "Catálogo con filtros",
        newTab: false,
        path: "/shop-with-sidebar",
      },
      {
        id: 62,
        title: "Catálogo completo",
        newTab: false,
        path: "/shop-without-sidebar",
      },
      {
        id: 64,
        title: "Consultar por WhatsApp",
        newTab: false,
        path: "/checkout",
      },
      {
        id: 65,
        title: "Mi selección",
        newTab: false,
        path: "/cart",
      },
      {
        id: 66,
        title: "Favoritos",
        newTab: false,
        path: "/wishlist",
      },
      {
        id: 70,
        title: "Contacto",
        newTab: false,
        path: "/contact",
      },
    ],
  },
];
