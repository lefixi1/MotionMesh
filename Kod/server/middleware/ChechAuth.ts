const checkAuth = (req: any, res: any, next: any) => {
  if (!req.session.user) {
    return res.status(401).send({ message: "Please log in first" });
  }
  if (!req.session.user.user_id) {
    return res.status(401).send({ message: "Invalid session" });
  }
  next();
};

export default checkAuth;
