import { Router } from "express";
import { productModel } from "../models/products.models.js";
import paginate from "mongoose-paginate-v2";
import { authorization, passportError } from "../utils/messagesError.js";

const prodsRouter = Router();

prodsRouter.get("/", async (req, res) => {
  const { sort, limit = 10, page = 1, category } = req.query;

  try {
    const query = category ? { category } : {};

    const filtros = { page: parseInt(page), limit: parseInt(limit) };
    const resultado = await productModel.paginate(query, {
      sort:
        sort === "asc"
          ? { price: "asc" }
          : sort === "desc"
          ? { price: "desc" }
          : undefined,
      ...filtros,
    });
    res.status(200).send({ respuesta: "Ok", mensaje: resultado });
  } catch (error) {
    res
      .status(404)
      .send({ respuesta: "Error al consultar productos", mensaje: error });
  }
});


prodsRouter.get("/:pid", async (req, res) => {
  const { pid } = req.params;
  try {
    if (prod) {
      res.status(200).send({ respuesta: "Ok", mensaje: prod });
    } else {
      res.status(404).send({ respuesta: "Not Found", mensaje: "Not Found" });
    }
  } catch {
    res.status(404).send({ respuesta: "Not Found", mensaje: "Not Found" });
  }
  const prod = await productModel.findById(pid);
});

prodsRouter.post(
  "/",
  passportError("jwt"),
  authorization("admin"),
  async (req, res) => {
    const { title, description, code, price, stock, category, quantity } =
      req.body;
    try {
      const prod = await productModel.create(
        title,
        description,
        code,
        price,
        stock,
        category,
        quantity
      );
      res.status(200).send({ respuesta: "Ok", mensaje: prod });
    } catch (error) {
      res
        .status(404)
        .send({ respuesta: "Error al agregar producto", mensaje: error });
    }
  }
);

prodsRouter.put(
  "/:pid",
  passportError("jwt"),
  authorization("admin"),
  async (req, res) => {
    const { pid } = req.params;
    const {
      title,
      description,
      code,
      price,
      stock,
      category,
      status,
      thumbnails,
    } = req.body;
    try {
      const prod = await productModel.findByIdAndUpdate(pid, {
        title,
        description,
        code,
        price,
        stock,
        category,
        status,
        thumbnails,
      });
      res.status(200).send({
        respuesta: "Producto actualizado correctamente",
        mensaje: prod,
      });
    } catch (error) {
      res
        .status(404)
        .send({ respuesta: "Error al actualizar producto", mensaje: error });
    }
  }
);

prodsRouter.delete(
  "/:pid",
  passportError("jwt"),
  authorization("admin"),
  async (req, res) => {
    const { pid } = req.params;
    try {
      await productModel.findByIdAndDelete(pid);
      res.status(200).send("Producto eliminado correctamente");
    } catch (error) {
      res
        .status(404)
        .send({ respuesta: "Error al eliminar producto", mensaje: error });
    }
  }
);

export default prodsRouter;
