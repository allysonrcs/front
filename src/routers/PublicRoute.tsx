import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Login } from "@/pages/auth/Login";
import { RecoverPassword } from "@/pages/auth/RecoverPassword";
import { UpdatePassword } from "@/pages/auth/UpdatePassword";
import { CreateUser } from "@/pages/auth/CreateUser";

const RedirectToHtmlPage = () => {
    window.location.href = "/html/checklist/checklist.html";
    return null;
};

const PublicRoute = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<Navigate replace to='/auth/login' />} />
                <Route path='/auth' element={<Navigate replace to='/auth/login' />} />
                <Route path='/auth/login' element={<Login />} />
                <Route path='/auth/recuperar-senha' element={<RecoverPassword />} />
                <Route path='/auth/alterar-senha' element={<UpdatePassword />} />
                <Route path='/checklist-publico' element={<RedirectToHtmlPage />} />
                <Route path='/cadastrar' element={<CreateUser />} />
                <Route path='*' element={<Navigate replace to='/auth/login' />} />
            </Routes>
        </BrowserRouter>
    );
};

export default PublicRoute;
