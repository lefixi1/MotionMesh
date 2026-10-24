const checkAdmin = (req: any, res: any, next: any) => {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.status(403).send({ message: "Admin only" });
  }

  next();
};

export default checkAdmin;
