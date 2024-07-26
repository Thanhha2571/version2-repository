import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import "./Salary.css"
import * as XLSX from "xlsx";
import { message } from "antd";
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { DatePicker, Space } from 'antd';
import { baseUrl } from "components/api/httpService";
import CountIcon from "../../assets/images/icon-count.png"
import ExportIcon from "../../assets/images/export-icon.png"
import LockIcon from "../../assets/images/icon-lock.png"
import UnLock from "../../assets/images/icon-unlock.png"

dayjs.extend(customParseFormat);
const monthFormat = 'MM/YYYY';

const SalarySummarizie = () => {
    document.title = 'Salary Summarization'
    const [inputMonth, setInputMonth] = useState("")
    const [inputYear, setInputYear] = useState("")
    const [inputId, setInputId] = useState("")
    const [inputName, setInputName] = useState("")
    const [salaryListByMonth, setSalaryListByMonth] = useState()
    const [monthPicker, setMonthPicker] = useState("")
    const [monthCountingPikcer, setMonthCountingPikcer] = useState("")
    const [variableCountingSalary, setVariableCountingSalary] = useState()

    const userString = localStorage.getItem('user');
    const userObject = userString ? JSON.parse(userString) : null;

    const [salaryCountingFormState, setSalaryCountingFormState] = useState(false)
    const [editSalaryCountingFormState, setEditSalaryCountingFormState] = useState(false)
    const [loading, setLoading] = useState(false);
    const [exportEmployee, setExportEmployee] = useState(false)
    const [checkManager, setCheckManager] = useState(false)
    const [selectedUserName, setSelectedUserName] = useState("")
    const [userList, setUserList] = useState()
    const [userListSearch, setUserListSearch] = useState()

    const PAGE_SIZE = 50
    const [currentPage, setCurrentPage] = useState(1);
    const indexOfLastItem = currentPage * PAGE_SIZE;
    const indexOfFirstItem = indexOfLastItem - PAGE_SIZE;
    const currentUsers = salaryListByMonth?.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(salaryListByMonth?.length / PAGE_SIZE);

    const [lockState, setLockState] = useState(false)
    const [notiLockSalary, setNotiLockSalary] = useState()

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleMonthChange = (date, dateString) => {
        console.log('Selected Date:', dateString);
        setMonthPicker(dateString)
    };

    const handleMonthCountingChange = (date, dateString) => {
        setMonthCountingPikcer(dateString)
    }

    const getLockState = async () => {
        // if (userObject.role === 'Admin') {
            try {
                const { data } = await axios.get(
                    `${baseUrl}/api/admin/manage-salary/lock/get`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`
                        }
                    }
                );
                setLockState(data?.message?.status)
            } catch (err) {
                alert(err?.response?.data?.message)
            }
        // }
    }
    useEffect(() => {
        if (userObject?.role === 'Manager') {
            setCheckManager(true)
        }
        getLockState()
    }, [userObject?.role]);

    const handleSeacrh = async () => {
        if (userObject.role === 'Admin' && monthPicker !== "" && inputId === "" && inputName === "") {
            try {
                const { data } = await axios.get(
                    `${baseUrl}/api/admin/manage-salary/get?year=${monthPicker.substring(3, 7)}&month=${monthPicker.substring(0, 2)}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`
                        }
                    }
                );
                setSalaryListByMonth(data?.message)
                console.log(data?.message);
                // setInputMonth("")
                // setInputYear("")
                // console.log("data", data?.message);
                // console.log(data?.);
            } catch (err) {
                alert("No salary recorded")
            }
        }
        if (userObject.role === 'Admin' && monthPicker !== "" && inputId !== "" && inputName !== "") {
            setSalaryListByMonth([])
            try {
                const { data } = await axios.get(
                    `${baseUrl}/api/admin/manage-salary/get?year=${monthPicker.substring(3, 7)}&month=${monthPicker.substring(0, 2)}&employeeID=${inputId}&employeeName=${inputName}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`
                        }
                    }
                );
                setSalaryListByMonth(data?.message)
                console.log(data?.message);
                // console.log("data", data?.message);
                // console.log(data?.);
            } catch (err) {
                alert("No salary recorded")
            }
        }
        if (userObject.role === 'Inhaber' && monthPicker !== "" && inputId === "" && inputName === "") {
            setSalaryListByMonth([])
            try {
                const { data } = await axios.get(
                    `${baseUrl}/api/inhaber/manage-salary/get?year=${monthPicker.substring(3, 7)}&month=${monthPicker.substring(0, 2)}&inhaber_name=${userObject?.name}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`
                        }
                    }
                );
                setSalaryListByMonth(data?.message)
                // console.log("data", data?.message);
                // console.log(data?.);
            } catch (err) {
                alert("No salary recorded")
            }
        }
        if (userObject.role === 'Inhaber' && monthPicker !== "" && inputId !== "" && inputName !== "") {
            setSalaryListByMonth([])
            try {
                const { data } = await axios.get(
                    `${baseUrl}/api/inhaber/manage-salary/get?year=${monthPicker.substring(3, 7)}&month=${monthPicker.substring(0, 2)}&inhaber_name=${userObject?.name}&employeeID=${inputId}&employeeName=${inputName}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`
                        }
                    }
                );
                setSalaryListByMonth(data?.message)
                // console.log("data", data?.message);
                // console.log(data?.);
            } catch (err) {
                alert("No salary recorded")
            }
        }
    }

    const [formData, setFormData] = useState({
        user: {
            id: '',
            month: '',
            year: '',
            a: '',
            b: '',
            c: '',
            d: '0.25',
            f: ''
        },
    });

    const convertCommaStringToNumber = (str) => {
        // Check if the input is a string and not empty
        if (typeof str !== 'string' || !str.trim()) {
            console.error("Invalid input: Not a string or empty", str);
            return str; // Handle invalid input as needed
        }

        // Replace all commas with dots
        const dotString = str.replace(/,/g, '.');

        // Convert to a float
        const number = parseFloat(dotString);

        // Check if the conversion was successful (NaN check)
        if (isNaN(number)) {
            console.error("Invalid number format:", str);
            return null; // Handle invalid number format as needed
        }

        return number;
    };


    useEffect(() => {
        const getUserList = async () => {
            if (userObject.role === 'Admin' && formData?.user?.id !== "") {
                try {
                    const { data } = await axios.get(
                        `${baseUrl}/api/admin/manage-all/search-specific?details=${formData?.user?.id}`,
                        {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem("token")}`
                            }
                        }
                    );
                    setUserList(data?.message)
                    // console.log("data", data?.message);
                    // console.log(data?.);
                } catch (err) {
                    // alert(err.response?.data?.message)
                }
            }
            if (userObject.role === 'Inhaber' && formData?.user?.id !== "") {
                try {
                    const { data } = await axios.get(
                        `${baseUrl}/api/inhaber/manage-employee/search-specific?inhaber_name=${userObject?.name}&details=${formData?.user?.id}`,
                        {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem("token")}`
                            }
                        }
                    );
                    setUserList(data?.message)
                    // console.log("data", data?.message);
                    // console.log(data?.);
                } catch (err) {
                    // alert(err.response?.data?.message)
                }
            }
        }
        const getUserListSearch = async () => {
            if (userObject.role === 'Admin' && inputId !== "") {
                try {
                    const { data } = await axios.get(
                        `${baseUrl}/api/admin/manage-all/search-specific?details=${inputId}`,
                        {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem("token")}`
                            }
                        }
                    );
                    setUserListSearch(data?.message)
                    // console.log("data", data?.message);
                    // console.log(data?.);
                } catch (err) {
                    // alert(err.response?.data?.message)
                }
            }
            if (userObject.role === 'Inhaber' && inputId !== "") {
                try {
                    const { data } = await axios.get(
                        `${baseUrl}/api/inhaber/manage-employee/search-specific?inhaber_name=${userObject?.name}&details=${inputId}`,
                        {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem("token")}`
                            }
                        }
                    );
                    setUserListSearch(data?.message)
                    // console.log("data", data?.message);
                    // console.log(data?.);
                } catch (err) {
                    // alert(err.response?.data?.message)
                }
            }
        }
        getUserList()
        getUserListSearch()
    }, [formData?.user?.id, inputId]);

    useEffect(() => {
        const getUseVariableCoutingSalary = async () => {
            if (formData?.user?.id && selectedUserName && monthCountingPikcer) {
                if (userObject?.role == 'Admin') {
                    setLoading(true);
                    try {
                        const { data } = await axios.get(
                            `${baseUrl}/api/admin/manage-salary/get?year=${monthCountingPikcer.substring(3, 7)}&month=${monthCountingPikcer.substring(0, 2)}&employeeID=${formData?.user?.id}&employeeName=${selectedUserName}`,
                            {
                                headers: {
                                    Authorization: `Bearer ${localStorage.getItem("token")}`
                                }
                            }
                        );
                        setVariableCountingSalary(data?.message)
                        setLoading(false);
                    } catch (err) {
                        alert(err.response?.data?.message)
                        setLoading(false);
                    }
                }
                if (userObject?.role == 'Inhaber') {
                    setLoading(true);
                    try {
                        const { data } = await axios.get(
                            `${baseUrl}/api/inhaber/manage-salary/get?year=${monthCountingPikcer.substring(3, 7)}&month=${monthCountingPikcer.substring(0, 2)}&employeeID=${formData?.user?.id}&employeeName=${selectedUserName}&inhaber_name=${userObject?.name}`,
                            {
                                headers: {
                                    Authorization: `Bearer ${localStorage.getItem("token")}`
                                }
                            }
                        );
                        setVariableCountingSalary(data?.message)
                        setLoading(false);
                    } catch (err) {
                        alert(err.response?.data?.message)
                        setLoading(false);
                    }
                }
            }
        }
        getUseVariableCoutingSalary()

    }, [formData?.user?.id, selectedUserName, monthCountingPikcer])

    // console.log(variableCountingSalary);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            user: {
                ...prevData.user,
                [name]: value,
            },
        }));
    };

    useEffect(() => {
        if (variableCountingSalary) {
            setFormData({
                user: {
                    ...formData.user,
                    a: variableCountingSalary[0]?.a_parameter,
                    b: variableCountingSalary[0]?.b_parameter,
                    c: variableCountingSalary[0]?.c_parameter,
                    d: variableCountingSalary[0]?.d_parameter,
                    f: variableCountingSalary[0]?.f_parameter
                }
            })
        }
    }, [variableCountingSalary])

    const handleSubmit = (e) => {
        e.preventDefault();

        setLoading(true)
        const salaryCounting = async () => {
            if (userObject?.role === "Admin") {
                try {
                    const { data } = await axios.post(
                        `${baseUrl}/api/admin/manage-salary/calculate/${formData.user.id}?employeeName=${selectedUserName}&year=${monthCountingPikcer.substring(3, 7)}&month=${monthCountingPikcer.substring(0, 2)}`,
                        {
                            a_new: convertCommaStringToNumber(formData.user.a),
                            b_new: convertCommaStringToNumber(formData.user.b),
                            c_new: convertCommaStringToNumber(formData.user.c),
                            d_new: convertCommaStringToNumber(formData.user.d),
                            f_new: convertCommaStringToNumber(formData.user.f)
                        },
                        {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem("token")}`
                            }
                        }
                    );
                    setLoading(false);
                    setFormData({
                        user: {
                            id: '',
                            a: '',
                            b: '',
                            c: '',
                            d: '0.25',
                            f: ''
                        },
                    });
                    setSelectedUserName("")
                    setMonthCountingPikcer("")
                    setSalaryCountingFormState(false)
                } catch (err) {
                    console.log(err);
                    alert(err.response?.data?.message)
                    setLoading(false)
                } finally {
                    handleSeacrh()
                }
            }

            if (userObject?.role === "Inhaber") {
                try {
                    const { data } = await axios.post(
                        `${baseUrl}/api/inhaber/manage-salary/calculate/${formData.user.id}?employeeName=${selectedUserName}&year=${monthCountingPikcer.substring(3, 7)}&month=${monthCountingPikcer.substring(0, 2)}`,
                        {
                            a_new: convertCommaStringToNumber(formData.user.a),
                            b_new: convertCommaStringToNumber(formData.user.b),
                            c_new: convertCommaStringToNumber(formData.user.c),
                            d_new: convertCommaStringToNumber(formData.user.d),
                            f_new: convertCommaStringToNumber(formData.user.f)
                        },
                        {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem("token")}`
                            }
                        }
                    );
                    setLoading(false);
                    setFormData({
                        user: {
                            id: '',
                            a: '',
                            b: '',
                            c: '',
                            d: '0.25',
                            f: ''
                        },
                    });
                    setSelectedUserName("")
                    setMonthCountingPikcer("")
                    setSalaryCountingFormState(false)
                } catch (err) {
                    // Handle error
                    alert(err.response?.data?.message);
                    setLoading(false)
                } finally {
                    handleSeacrh()
                }
            }
        };
        salaryCounting()
    }
    const handleExportSalaryByEmloyeeFile = async () => {
        setLoading(true);
        if (userObject?.role === "Admin") {
            try {
                setLoading(true);
                const { data } = await axios.post(
                    `${baseUrl}/api/admin/manage-xlsx/salary-stats`,
                    {
                        salaries: salaryListByMonth
                    },
                    {
                        responseType: "arraybuffer", headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`
                        }
                    }
                );

                const blob = new Blob([data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
                const link = document.createElement("a");

                link.href = window.URL.createObjectURL(blob);
                link.download = `Employee_Salary_Data_${monthPicker.substring(0, 2)}_${monthPicker.substring(3, 7)}.xlsx`;

                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } catch (error) {
                // console.error("Error exporting Excel file:", error);
            } finally {
                setLoading(false);
                setExportEmployee(false)
            }
        }
        if (userObject?.role === "Inhaber") {
            try {
                setLoading(true);
                const { data } = await axios.post(
                    `${baseUrl}/api/inhaber/manage-xlsx/salary-stats`,
                    {
                        salaries: salaryListByMonth
                    },
                    {
                        responseType: "arraybuffer", headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`
                        }
                    }
                );

                const blob = new Blob([data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
                const link = document.createElement("a");

                link.href = window.URL.createObjectURL(blob);
                link.download = `Employee_Salary_Data_${monthPicker.substring(0, 2)}_${monthPicker.substring(3, 7)}.xlsx`;

                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } catch (error) {
                console.error("Error exporting Excel file:", error);
            } finally {
                setLoading(false);
                setExportEmployee(false)
            }
        }
    }

    const handleCancelFormCountingSalary = () => {
        setSalaryCountingFormState(false)
        setFormData({
            user: {
                id: '',
                month: '',
                year: '',
                a: '',
                b: '',
                c: '',
                d: '0.25',
                f: ''
            },
        })
        setSelectedUserName("")
    }

    const handleLockSalary = async (e) => {
        e.preventDefault();
        if (userObject.role === 'Admin') {
            try {
                const { data } = await axios.put(
                    `${baseUrl}/api/admin/manage-salary/lock/update`,
                    {
                        status: !lockState
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`
                        }
                    }
                );
                setLockState(data?.message?.status)
            } catch (err) {
                alert(err?.response?.data?.message)
            }
        }
    }

    const handleOpenCountingForm = (e) => {
        e.preventDefault();
        if (lockState === true) {
            setNotiLockSalary(true)
        }else {
            setSalaryCountingFormState(true)
        }
    }
    return (
        <div>
            {checkManager ? (<div className="ml-[260px] h-auto p-5 flex flex-col font-Changa text-textColor gap-5">YOU CANNOT ACCESS THIS ROUTE</div>) : (<div className="relative ml-[260px] h-auto p-5 flex flex-col font-Changa text-textColor gap-5">
                <div className="flex flex-row items-center justify-between">
                    <div>
                        <h1 className="font-bold text-3xl">Salary Summarize</h1>
                        <div className="flex flex-row">
                            <Link className="text-xl font-semibold leading-6 hover:underline" to="/dashboard">Dashboard</Link>
                            <span className="text-[#6c757d] font-xl">/ Salary</span>
                            <Link className="text-[#6c757d] font-xl leading-6 hover:underline" to="/salary/summarize">/ Salary Summarize</Link>
                        </div>
                    </div>
                    <div className="flex flex-row px-4 gap-4">
                        <div className="flex flex-row gap-2 justify-center item"></div>
                        {userObject?.role === "Admin" && (<button onClick={handleLockSalary} className="bg-buttonColor2 text-white text-base flex flex-row gap-1 justify-center items-center border border-solid p-2 rounded-md hover:bg-emerald-800">
                            <img src={lockState ? UnLock : LockIcon} className="w-6 h-auto" alt="lock/unlock icon" />
                            {lockState ? 'Click to Unlock' : 'Click to Lock'}
                        </button>)}

                        <button onClick={handleOpenCountingForm} className="bg-buttonColor2 text-white text-base flex flex-row gap-1 justify-center items-center border border-solid p-2 rounded-md hover:bg-emerald-800">
                            <img src={CountIcon} className="w-6 h-auto" />
                            Gehaltszählung
                        </button>
                        <button onClick={() => setExportEmployee(!exportEmployee)} className="bg-buttonColor1 text-white text-base flex flex-row gap-1 justify-center items-center border border-solid p-2 rounded-md hover:bg-cyan-800">
                            <img src={ExportIcon} className="w-6 h-auto" />
                            Exportdatei
                        </button>
                    </div>
                </div>
                <div className="border border-solid border-t-[#6c757d]"></div>

                <div className="z-10 flex flex-row mt-10 justify-between h-[50px]">
                    <div className="flex flex-row gap-20 w-3/5">
                        <Space className="w-1/3 text-[#6c757d]" direction="vertical" size={12}>
                            <DatePicker onChange={handleMonthChange} className="w-full h-[50px] text-base text-placeholderTextColor" format={monthFormat} picker="month" />
                        </Space>
                        <input
                            className="border-[#d9d9d9] text-[#6c757d] rounded-[6px] w-1/3 text-base px-4 py-3 placeholder:text-placeholderTextColor hover:border-[#4096ff] focus:border-[#4096ff]"
                            type="text"
                            placeholder="Enter ID"
                            value={inputId}
                            onChange={(e) => setInputId(e.target.value)}
                        />
                        <div className="w-2/3 flex flex-col gap-2 h-[50px]">
                            <select
                                id="name_search"
                                name="name_search"
                                className="w-full cursor-pointer h-[50px] border-[#d9d9d9] rounded-[6px] text-[#6c757d] hover:border-[#4096ff] focus:border-[#4096ff]"
                                value={inputName}
                                onChange={(e) => setInputName(e.target.value)}
                            // required
                            >
                                <option value="" disabled className='italic text-sm'>Select Employee Name*</option>
                                {userListSearch?.map((item, index) => (
                                    <option className='text-sm text-[#6c757d] w-full' key={index} value={item.name}>
                                        {item.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div
                        onClick={handleSeacrh}
                        className="bg-buttonColor2 text-white text-base flex flex-row gap-1 justify-center items-center border border-solid p-2 rounded-md cursor-pointer hover:bg-emerald-700 w-1/6">
                        <button className="search-btn">Suchen</button>
                    </div>
                </div>

                <div className="block w-full text-base font-Changa mt-5 overflow-y-scroll overflow-x-scroll">
                    <table className="w-full table">
                        <thead className="">
                            <tr className="">
                                <th className="p-2 text-left">
                                    <span className="font-bold">Name</span>
                                </th>
                                <th className="p-2 text-left">
                                    <span className="table-title-id">Employee ID</span>
                                </th>
                                <th className="p-2 text-left">
                                    <span className="table-title-status">ARBEITSZEIT</span>
                                </th>
                                <th className="p-2 text-left">
                                    <span className="table-title-status">Total funktionsfähig</span>
                                </th>
                                {/* <th className="p-2 text-left">
                                    <span className="table-title-status">Im Laufe der Zeit</span>
                                </th> */}
                                <th className="p-2 text-left">
                                    <span className="table-title-status">netto</span>
                                </th>
                                <th className="p-2 text-left">
                                    <span className="table-title-status">überweisung</span>
                                </th>
                                <th className="p-2 text-left">
                                    <span className="table-title-status">optional</span>
                                </th>
                                <th className="p-2 text-left">
                                    <span className="table-title-status">€/km (0,25)</span>
                                </th>
                                <th className="p-2 text-left">
                                    <span className="table-title-status">über s x</span>
                                </th>
                                <th className="p-2 text-left">
                                    <span className="table-title-status">Total Km</span>
                                </th>
                                <th className="p-2 text-left">
                                    <span className="table-title-status">Gehalt</span>
                                </th>
                            </tr>
                        </thead>
                        {Array.isArray(currentUsers) && currentUsers?.length === 0 ? (
                            <div className="no-result-text text-center">NO RESULT</div>
                        ) : (
                            <tbody className="tbody">
                                {currentUsers?.map(({ employee_id, employee_name, hour_normal, total_hour_work, total_hour_overtime, a_parameter, b_parameter, c_parameter, d_parameter, f_parameter, total_km, total_salary }) => (
                                    <tr className="tr-item" key={employee_id}>
                                        <td className="p-2 hover:text-buttonColor2">
                                            <h2 className="text-left">
                                                <Link className="cursor-pointer flex flex-col" to={`/salary/sumarize/${employee_id}/${employee_name}`}>{employee_name}
                                                </Link>
                                            </h2>
                                        </td>
                                        <td className="p-2">{employee_id}</td>
                                        <td className="p-2">
                                            <div className="flex flex-col">
                                                {hour_normal?.map(({ department_name, total_hour, total_minutes }) => (
                                                    <div className="flex flex-row gap-3">
                                                        <span>{department_name}: {total_hour}h {total_minutes}m</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="p-2">{total_hour_work}</td>
                                        {/* <td className="p-2">{total_hour_overtime}</td> */}
                                        <td className="p-2">{a_parameter}</td>
                                        <td className="p-2">{b_parameter}</td>
                                        <td className="p-2">{c_parameter}</td>
                                        <td className="p-2">{d_parameter}</td>
                                        <td className="p-2">{f_parameter}</td>
                                        <td className="p-2">{total_km}</td>
                                        <td className="p-2">{total_salary}</td>
                                    </tr>
                                ))}
                            </tbody>
                        )}
                    </table>
                </div>
                <div className="flex justify-center">
                    {totalPages > 1 && (
                        <div className="flex flex-row gap-2">
                            {Array.from({ length: totalPages }).map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => handlePageChange(index + 1)}
                                    className="text-xl border border-solid py-2 px-4 hover:bg-[#f6f6f6]"
                                // className={`pagination-button ${currentPage === index + 1 ? 'active' : ''}`}
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                {salaryCountingFormState && (<div className="fixed top-0 bottom-0 right-0 left-0 z-20 font-Changa">
                    <div
                        onClick={() => setSalaryCountingFormState(false)}
                        className="absolute top-0 bottom-0 right-0 left-0 bg-[rgba(0,0,0,.45)] cursor-pointer"></div>
                    <div className="absolute w-[500px] top-0 right-0 bottom-0 z-30 bg-white overflow-y-auto">
                        <div className="w-full h-full">
                            <div className="flex flex-col mt-8">
                                <div className="flex flex-row justify-between px-8 items-center">
                                    <div className="font-bold text-xl">Gehaltszählung</div>
                                    <div
                                        onClick={handleCancelFormCountingSalary}
                                        // onClick={() => setSalaryCountingFormState(false)}
                                        className="text-lg border border-solid border-[rgba(0,0,0,.45)] py-1 px-3 rounded-full cursor-pointer">x</div>
                                </div>
                                <div className="w-full border border-solid border-t-[rgba(0,0,0,.45)] mt-4"></div>
                                <div className="flex flex-col px-8 w-full mt-7">
                                    <form
                                        className="flex flex-col gap-6 w-full justify-center items-center"
                                        onSubmit={handleSubmit}>
                                        {loading && (<div className="absolute flex w-full h-full items-center justify-center">
                                            <div className="loader_auto"></div>
                                        </div>)}
                                        <div className="w-full h-auto flex flex-col gap-2">
                                            <div className="flex flex-row gap-2">
                                                <span className="text-rose-500">*</span>
                                                <span className="">Employee's ID</span>
                                            </div>
                                            <input
                                                type="text"
                                                className="border-[#d9d9d9] text-[#6c757d] rounded-[6px] h-[45px] w-full text-base px-4 py-3 placeholder:text-placeholderTextColor hover:border-[#4096ff] focus:border-[#4096ff]"
                                                name="id"
                                                required
                                                value={formData.user.id}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="w-full flex flex-col gap-2">
                                            <div className="flex flex-row gap-2">
                                                <span className="text-rose-500">*</span>
                                                <span className="">Employee's Name</span>
                                            </div>
                                            <select
                                                id="name"
                                                name="name"
                                                className="cursor-pointer border-[#d9d9d9] text-[#6c757d] rounded-[6px] h-[45px] w-full text-base px-4 py-3 placeholder:text-placeholderTextColor hover:border-[#4096ff] focus:border-[#4096ff]"
                                                value={selectedUserName}
                                                onChange={(e) => setSelectedUserName(e.target.value)}
                                            // required
                                            >
                                                <option value="" disabled className='italic text-sm'>Select Employee Name*</option>
                                                {userList?.map((item, index) => (
                                                    <option className='text-sm text-textColor w-full' key={index} value={item.name}>
                                                        {item.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="w-full h-auto flex flex-col gap-2">
                                            <div className="flex flex-row gap-2">
                                                <span className="text-rose-500">*</span>
                                                <span className="">Month</span>
                                            </div>
                                            <Space className="w-full text-[#6c757d] font-Changa" direction="vertical" size={12}>
                                                <DatePicker required onChange={handleMonthCountingChange} placeholder="Select Month" className="placeholder:text-sm placeholder:text-placeholderTextColor w-full h-[45px] text-base text-placeholderTextColor" format={monthFormat} picker="month" />
                                            </Space>
                                        </div>
                                        <div className="w-full h-auto flex flex-col gap-2">
                                            <div className="flex flex-row gap-2">
                                                {/* <span className="text-rose-500">*</span> */}
                                                <span className="">netto</span>
                                            </div>
                                            <input
                                                type="text"
                                                name="a"
                                                className="border-[#d9d9d9] text-[#6c757d] rounded-[6px] h-[45px] w-full text-base px-4 py-3 placeholder:text-placeholderTextColor hover:border-[#4096ff] focus:border-[#4096ff]"
                                                // required
                                                value={formData.user.a}
                                                onChange={handleChange}
                                                placeholder="12,34"
                                            />
                                        </div>
                                        <div className="w-full h-auto flex flex-col gap-2">
                                            <div className="flex flex-row gap-2">
                                                {/* <span className="text-rose-500">*</span> */}
                                                <span className="">überweisung</span>
                                            </div>
                                            <input
                                                type="text"
                                                name="b"
                                                className="border-[#d9d9d9] text-[#6c757d] rounded-[6px] h-[45px] w-full text-base px-4 py-3 placeholder:text-placeholderTextColor hover:border-[#4096ff] focus:border-[#4096ff]"
                                                // required
                                                value={formData.user.b}
                                                onChange={handleChange}
                                                placeholder="12,34"
                                            />
                                        </div>
                                        <div className="w-full h-auto flex flex-col gap-2">
                                            <div className="flex flex-row gap-2">
                                                {/* <span className="text-rose-500">*</span> */}
                                                <span className="">optional</span>
                                            </div>
                                            <input
                                                type="text"
                                                name="c"
                                                className="border-[#d9d9d9] text-[#6c757d] rounded-[6px] h-[45px] w-full text-base px-4 py-3 placeholder:text-placeholderTextColor hover:border-[#4096ff] focus:border-[#4096ff]"
                                                // required
                                                value={formData.user.c}
                                                onChange={handleChange}
                                                placeholder="12,34"
                                            />
                                        </div>
                                        <div className="w-full h-auto flex flex-col gap-2">
                                            <div className="flex flex-row gap-2">
                                                {/* <span className="text-rose-500">*</span> */}
                                                <span className="">€/km (0,25)</span>
                                            </div>
                                            <input
                                                type="text"
                                                name="d"
                                                className="border-[#d9d9d9] text-[#6c757d] rounded-[6px] h-[45px] w-full text-base px-4 py-3 placeholder:text-placeholderTextColor hover:border-[#4096ff] focus:border-[#4096ff]"
                                                // required
                                                value={formData.user.d}
                                                onChange={handleChange}
                                                placeholder="12,34"
                                            />
                                        </div>
                                        <div className="w-full h-auto flex flex-col gap-2">
                                            <div className="flex flex-row gap-2">
                                                {/* <span className="text-rose-500">*</span> */}
                                                <span className="">über s x</span>
                                            </div>
                                            <input
                                                type="text"
                                                name="f"
                                                className="border-[#d9d9d9] text-[#6c757d] rounded-[6px] h-[45px] w-full text-base px-4 py-3 placeholder:text-placeholderTextColor hover:border-[#4096ff] focus:border-[#4096ff]"
                                                // required
                                                value={formData.user.f}
                                                onChange={handleChange}
                                                placeholder="12,34"
                                            />
                                        </div>
                                        <div
                                            className=" bg-buttonColor2 text-white text-base flex flex-row gap-1 justify-center items-center border border-solid py-3 rounded-md cursor-pointer hover:bg-emerald-700 w-full">
                                            <button type="submit" className="w-full">Gehaltszählung</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>)}
                {exportEmployee && (<div className="fixed top-0 bottom-0 right-0 left-0 z-20 font-Changa">
                    <div
                        onClick={() => setExportEmployee(false)}
                        className="absolute top-0 bottom-0 right-0 left-0 bg-[rgba(0,0,0,.45)] cursor-pointer"></div>
                    <div className="absolute w-[700px] h-[200px] top-[300px] right-[500px] bottom-0 z-30 bg-white">
                        <div className="w-full h-full">
                            <div className="flex flex-col mt-8">
                                <div className="flex flex-row justify-between px-8 items-center">
                                    <div className="font-bold text-xl">Export file</div>
                                    <div
                                        onClick={() => setExportEmployee(false)}
                                        className="text-lg border border-solid border-[rgba(0,0,0,.45)] py-1 px-3 rounded-full cursor-pointer">x</div>
                                </div>
                                <div className="w-full border border-solid border-t-[rgba(0,0,0,.45)] mt-4"></div>
                                <div className="flex flex-col px-8 w-full mt-7 font-Changa justify-center items-center gap-4">
                                    <span>Möchten Sie exportieren Employee_Salary_Data_{monthPicker.substring(0, 2)}_{monthPicker.substring(3, 7)}.xlsx?</span>
                                    <div className="flex flex-row gap-3">
                                        <button onClick={() => setExportEmployee(false)} type="button" className="w-[100px] bg-rose-800 text-white text-base flex flex-row gap-1 justify-center items-center border border-solid px-2 py-1 rounded-md cursor-pointe">No</button>
                                        <button onClick={handleExportSalaryByEmloyeeFile} type="button" className="w-[100px] bg-buttonColor2 text-white text-base flex flex-row gap-1 justify-center items-center border border-solid px-2 py-1 rounded-md cursor-pointer">Yes</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>)}
                {notiLockSalary && (<div className="fixed top-0 bottom-0 right-0 left-0 z-20 font-Changa">
                    <div
                        onClick={() => setNotiLockSalary(false)}
                        className="absolute top-0 bottom-0 right-0 left-0 bg-[rgba(0,0,0,.45)] cursor-pointer"></div>
                    <div className="absolute w-[700px] h-[230px] top-[300px] right-[500px] bottom-0 z-30 bg-white">
                        <div className="w-full h-full">
                            <div className="flex flex-col mt-8">
                                <div className="flex flex-row justify-between px-8 items-center">
                                    {/* <img src={IconSucess} w-8 h-auto /> */}
                                    <span className="font-bold text-2xl">Salary Counting is Locked</span>
                                    <div
                                        onClick={() => setNotiLockSalary(false)}
                                        className="text-lg border border-solid border-[rgba(0,0,0,.45)] py-1 px-3 rounded-full cursor-pointer">x</div>
                                </div>
                                {/* <div className="w-full border border-solid border-t-[rgba(0,0,0,.45)] mt-4"></div> */}
                                <div className="flex flex-col px-8 w-full mt-7 font-Changa gap-4 items-center">
                                    <div className="flex flex-col gap-3 text-red-600 font-bold">
                                        <span className="text-xl text-center">Salary Counting is locked by Admin !!!</span>
                                        <span className="text-xl">Please contact Admin to unlock, if you want to use this function</span>
                                    </div>
                                    <div className="flex flex-row gap-3 justify-center items-center" onClick={() => setNotiLockSalary(false)}>
                                        <span
                                            // onClick={() => {
                                            //     setConfirmEmailModal(false)
                                            //     navigate('/login')
                                            // }}
                                            // href="/login"
                                            type="button" className="w-[100px] bg-buttonColor2 text-white text-base flex flex-row gap-1 justify-center items-center border border-solid px-2 py-1 rounded-md cursor-pointer">Okay</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>)}
            </div>)}
        </div>

    )
}

export default SalarySummarizie;