import local from "passport-local";
import passport from "passport";
import { createHash, validatePassword } from "../utils/bcrypt.js";
import githubStrategy from "passport-github2";
import { userModel } from "../models/users.models.js";

// Defino la estrategia a utilizar
const LocalStrategy = local.Strategy;
const initializePassport = () => {
  passport.use(
    "register",
    new LocalStrategy(
      { passReqToCallback: true, usernameField: "email" },
      async (req, username, password, done) => {
        //Registro de usuario

        const { first_name, last_name, email, age } = req.body;
        try {
          const user = await userModel.findOne({ email: email });
          if (user) {
            //caso de error: Usuario existente ---> Envío false

            console.log("Usuario existente");
            return done(null, false);
          }
          //Crear usuario
          const passwordHash = createHash(password);
          const userCreated = await userModel.create({
            first_name: first_name,
            last_name: last_name,
            age: age,
            email: email,
            password: passwordHash,
          });
          //Usuario creado ---> envio UserCreated
          console.log("Usuario creado")
          return done(null, userCreated);
        } catch (error) {
          return done();
        }
      }
    )
  );

  passport.use(
    "login",
    new LocalStrategy(
      {
        usernameField: "email",
      },
      async (username, password, done) => {
        try {
          const user = await userModel.findOne({ email: username });
          if (!user) {
            return done(null, false); //Si el usuario no existe
          } else {
            //Si existe valido la password
            if (validatePassword(password, user.password)) {
              //Valido la password que me envia el cliente
              return done(null, user);
            }
            //Credenciales no validas
            return done(null, false);
          }
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  //Inicializar la session del user

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  //Eliminar la session del user

  passport.deserializeUser(async (id, done) => {
    const user = await userModel.findById(id);
    done(null, user);
  });
};

//GITHUB

passport.use(
  "github",
  new githubStrategy(
    {
      clientID: process.env.client_ID,
      clientSecret: process.env.SECRET_CLIENT,
      callbackURL: process.env.CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log(accessToken);
        console.log(refreshToken);
        console.log(profile._json);

        const user = await userModel.findOne({ email: profile._json.email });
        if (user) {
          done(null, false);
        } else {
          const userCreated = await userModel.create({
            first_name: profile._json.name,
            last_name: " ",
            email: profile._json.email,
            age: 18, //Default Age
            password: createHash(profile._json.email + profile._json.name),
          });
          done(null, userCreated);
        }
      } catch (error) {
        done(error);
      }
    }
  )
);

export default initializePassport;
