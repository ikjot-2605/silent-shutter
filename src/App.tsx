import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { Gallery } from "./components/Gallery";
import { About } from "./components/About";
import { Contact } from "./components/Contact";
import { Footer } from "./components/Footer";
import { CategoryDetail } from "./components/CategoryDetail";

const HomePage = () => (
  <>
    <Hero />
    <Gallery />
    <About />
    <Contact />
  </>
);

export const App = () => {
  return (
    <BrowserRouter>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/category/:categoryId" element={<CategoryDetail />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
};
