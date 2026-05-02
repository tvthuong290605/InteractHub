import { useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import { registerAdmin } from "../../services/authService";

interface Props {
    open: boolean;
    onClose: () => void;
}

const RegisterModal: React.FC<Props> = ({ open, onClose }) => {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({
        fullName: "",
        email: "",
        password: "",
    });
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Ít nhất 1 chữ hoa, 1 chữ thường, 1 số, 1 ký tự đặc biệt, >= 8 ký tự
    const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

    if (!open) return null;

    const validate = () => {
        let newErrors = {
            fullName: "",
            email: "",
            password: "",
        };

        if (!fullName.trim()) {
            newErrors.fullName = "Không được để trống họ tên";
        }

        if (!email.trim()) {
            newErrors.email = "Email không được để trống";
        } else if (!emailRegex.test(email)) {
            newErrors.email = "Email không hợp lệ";
        }

        if (!password) {
            newErrors.password = "Mật khẩu không được để trống";
        } else if (!passwordRegex.test(password)) {
            newErrors.password =
                "Mật khẩu phải có chữ hoa, chữ thường, số, ký tự đặc biệt và ≥ 8 ký tự";
        }

        setErrors(newErrors);

        return !newErrors.fullName && !newErrors.email && !newErrors.password;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        try {
            await registerAdmin({
                fullName,
                email,
                password,
            });

            alert("Đăng ký thành công!");
            onClose();
        } catch (err: any) {
            alert(err.response?.data?.Message || "Lỗi đăng ký");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white w-[400px] rounded-2xl p-6 shadow-xl relative">

                {/* Close */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3"
                >
                    <X />
                </button>

                <h2 className="text-xl font-bold mb-4">Tạo tài khoản Admin</h2>

                <input
                    type="text"
                    placeholder="Họ tên"
                    className="w-full border p-2 mb-3 rounded"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                />
                {errors.fullName && (
                    <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                )}

                <input
                    type="email"
                    placeholder="Email"
                    className="w-full border p-2 mb-3 rounded"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}

                <div className="relative mb-4">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Mật khẩu"
                        className="w-full border p-2 pr-10 rounded"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    {/* Icon con mắt */}
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
                {errors.password && (
                    <p className="text-red-500 text-sm mb-2">{errors.password}</p>
                )}

                <button
                    onClick={handleSubmit}
                    className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700"
                >
                    Đăng ký
                </button>
            </div>
        </div>
    );
};

export default RegisterModal;