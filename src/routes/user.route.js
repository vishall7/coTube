import { Router } from "express"; 
import { isAuthorized, loginUser, registerUser, logoutUser, getCurrentUser, refreshAccessToken} from "../controllers/user.controller.js";
import { isYoutuber, verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router();

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)

//secure routes
router.route("/get-current-user").get(verifyJWT,getCurrentUser);
router.route("/logout").get(verifyJWT,logoutUser);
router.route("/isAuthorized").get(verifyJWT,isYoutuber,isAuthorized)
router.route("/refreshAccessToken").get(verifyJWT,refreshAccessToken)
export default router