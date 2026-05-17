// Prefija /uploads/ si la imagen es un nombre de archivo local; las URLs externas se usan tal cual
exports.serializeProduct = (p) => {
  const imagen    = p.imagen ?? '';
  const imageUrl  = imagen && !imagen.startsWith('http') ? `/uploads/${imagen}` : imagen;
  return {
    id:          p._id,
    name:        p.nombre,
    description: p.descripcion ?? '',
    price:       p.precio,
    imageUrl,
    categoryId:  p.categoria ?? null,
    stock:       p.stock ?? 0
  };
};

// Shape mínimo de producto embebido dentro de un ítem de carrito
exports.serializeCartProduct = (p) => ({
  id:          p._id,
  name:        p.nombre,
  description: p.descripcion ?? '',
  price:       p.precio,
  imageUrl:    p.imagen ?? '',
  categoryId:  p.categoria ?? null,
  stock:       p.stock ?? 0
});

// Mapea un doc Categoria al shape público { id, name }
exports.serializeCategory = (c) => ({ id: c._id, name: c.nombre });
