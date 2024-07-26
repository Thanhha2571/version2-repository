import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { positionList } from "assets/data/data";
import { roleList, roleListForInhaber, roleListForManager } from "assets/data/data";
import EmployeeItem from "./EmployeeItem";
import "./Employee.css"
import axios, { all } from "axios";
import * as XLSX from "xlsx";
import { baseUrl } from "components/api/httpService";
import { Pagination } from 'antd';

// import { response, response } from "express";
function Employee() {
    document.title = "Employee";
    const [selectedPosition, setSelectedPosition] = useState("Select Position")
    const [selectedDepartment, setSelectedDepartment] = useState("")
    const [selectedRole, setSelectedRole] = useState("")
    const [departmentInhaberOrManager, setDepartmentInhaberOrManager] = useState()
    const [exportState, setExportState] = useState(false)

    const [positionMenu, setPositionMenu] = useState(false)
    const [departmentMenu, setDepartmentMenu] = useState(false)
    const [roleMenu, setRoleMenu] = useState(false)

    const [addEmployee, setAddEmployee] = useState(false)
    const [exportEmployee, setExportEmployee] = useState(false)

    const [loading, setLoading] = useState(false);
    const [loadingSearching, setLoadingSearching] = useState(false);
    const [userList, setUserList] = useState()
    const [userObject, setUserObject] = useState()

    const [departmentList, setDepartmentList] = useState()

    const [selectedDepartmentEmployee, setSelectedDepartmentEmployee] = useState('');
    const [selectedPositionEmployee, setSelectedPositionEmployee] = useState('');
    const [selectedRoleUser, setSelectedRoleUser] = useState('');
    const [inputSearch, setInputSearch] = useState("");

    const [positionFormMenuState, setPositionFormMenuState] = useState(false)

    const [checkRole, setCheckRole] = useState(false)
    const [checkInhaber, setCheckInhaber] = useState(false)
    const [checkManager, setCheckManager] = useState(false)
    const [checkAdmin, setCheckAdmin] = useState(false)
    const [checkAdminAndInhaber, setCheckAdminAndInhaber] = useState(false)

    // const PAGE_SIZE = 50
    // const [currentPage, setCurrentPage] = useState(1);
    // const indexOfLastItem = currentPage * PAGE_SIZE;
    // const indexOfFirstItem = indexOfLastItem - PAGE_SIZE;
    // const currentUsers = userList?.slice(indexOfFirstItem, indexOfLastItem);

    // const totalPages = Math.ceil(userList?.length / PAGE_SIZE);

    const [pageSize, setPageSize] = useState(20);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0)
    const indexOfLastItem = currentPage * pageSize;
    const indexOfFirstItem = indexOfLastItem - pageSize;
    // const currentUsers = userList?.slice(indexOfFirstItem, indexOfFirstItem + pageSize);

    // const totalPages = Math.ceil(userList?.length / pageSize);

    const handlePageChange = async (page, size) => {
        setCurrentPage(page);
        setPageSize(size);
    };

    useEffect(() => {
        const userString = localStorage.getItem('user');
        const userObject = userString ? JSON.parse(userString) : null;
        setUserObject(userObject)
        console.log(userObject);
    }, [])

    useEffect(() => {
        if (userObject?.role === "Inhaber" || userObject?.role === "Manager") {
            const arrayFilter = userObject?.department?.map(item => ({ name: item.name })) || [];
            setDepartmentList(arrayFilter);
            console.log("arrayFilter", arrayFilter);
        }
    }, [userObject?.role])
    // const handlePageChange = (page) => {
    //     setCurrentPage(page);
    // };

    const [formData, setFormData] = useState({
        user: {
            id: '',
            name: '',
            password: '',
            email: '',
        },
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            user: {
                ...prevData.user,
                [name]: value,
            },
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);

        // ----------------------------------------------------------------CREATE BY ADMIN ---------------------------------------------------------------- //

        //CREATE EMPLOYEE BY ADMIN
        if (userObject?.role === 'Admin' && selectedRoleUser === 'Employee') {
            try {
                const { data } = await axios.post(
                    `${baseUrl}/api/auth/manage-admin/register-employee`,
                    {
                        id: formData.user.id.trim(),
                        name: formData.user.name.trim(),
                        password: formData.user.password,
                        email: formData.user.email,
                        department_name: selectedDepartmentEmployee,
                        role: "Employee",
                        position: selectedPositionEmployee,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`
                        }
                    }
                );

                getAllUsers()
                // setTimeout(() => {
                //     window.location.reload();
                // }, 3000);
            } catch (err) {
                alert(err.response?.data?.message)
            } finally {
                setLoading(false);
                setAddEmployee(false)
                setFormData({
                    user: {
                        id: '',
                        name: '',
                        password: '',
                        email: '',
                    },
                })
                setSelectedPositionEmployee("")
                setSelectedDepartmentEmployee("")
                setSelectedRoleUser("")
                setPositionFormMenuState(false)

            }
        }
        //CREATE EMPLOYEE BY INHABER
        if (userObject?.role === 'Inhaber' && selectedRoleUser === 'Employee') {
            try {
                const { data } = await axios.post(
                    `${baseUrl}/api/auth/manage-inhaber/register-employee?inhaber_name=${userObject?.name}`,
                    {
                        id: formData.user.id.trim(),
                        name: formData.user.name.trim(),
                        password: formData.user.password,
                        email: formData.user.email,
                        department_name: selectedDepartmentEmployee,
                        role: "Employee",
                        position: selectedPositionEmployee,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`
                        }
                    }
                );

                getAllUsers()
            } catch (err) {
                alert(err.response?.data?.message)
            } finally {
                setLoading(false);
                setAddEmployee(false)
                setFormData({
                    user: {
                        id: '',
                        name: '',
                        password: '',
                        email: '',
                    },
                })
                setSelectedPositionEmployee("")
                setSelectedDepartmentEmployee("")
                setSelectedRoleUser("")
                setPositionFormMenuState(false)
            }
        }
        //CREATE EMPLOYEE BY MANAGER
        if (userObject?.role === 'Manager' && selectedRoleUser === 'Employee') {
            try {
                const { data } = await axios.post(
                    `${baseUrl}/api/auth/manage-manager/register-employee?manager_name=${userObject?.name}`,
                    {
                        id: formData.user.id.trim(),
                        name: formData.user.name.trim(),
                        password: formData.user.password,
                        email: formData.user.email,
                        department_name: selectedDepartmentEmployee,
                        role: "Employee",
                        position: selectedPositionEmployee,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`
                        }
                    }
                );

                getAllUsers()
            } catch (err) {
                alert(err.response?.data?.message)
            } finally {
                setLoading(false);
                setAddEmployee(false)
                setFormData({
                    user: {
                        id: '',
                        name: '',
                        password: '',
                        email: '',
                    },
                })
                setSelectedPositionEmployee("")
                setSelectedDepartmentEmployee("")
                setSelectedRoleUser("")
                setPositionFormMenuState(false)
            }
        }
        //CREATE MANAGER BY INHABER
        if (userObject?.role === 'Inhaber' && selectedRoleUser === 'Manager') {
            try {
                const { data } = await axios.post(
                    `${baseUrl}/api/auth/manage-inhaber/register-manager?inhaber_name=${userObject?.name}`,
                    {
                        id: formData.user.id.trim(),
                        name: formData.user.name.trim(),
                        password: formData.user.password,
                        email: formData.user.email,
                        department_name: selectedDepartmentEmployee,
                        role: "Manager",
                        position: selectedPositionEmployee,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`
                        }
                    }
                );

                getAllUsers()
            } catch (err) {
                alert(err.response?.data?.message)
            } finally {
                setLoading(false);
                setAddEmployee(false)
                setFormData({
                    user: {
                        id: '',
                        name: '',
                        password: '',
                        email: '',
                    },
                })
                setSelectedPositionEmployee("")
                setSelectedDepartmentEmployee("")
                setSelectedRoleUser("")
                setPositionFormMenuState(false)
            }
        }

        //CREATE INHABER BY ADMIN
        if (userObject?.role === 'Admin' && selectedRoleUser === 'Inhaber') {
            try {
                const { data } = await axios.post(
                    `${baseUrl}/api/auth/manage-admin/register-inhaber`,
                    {
                        id: formData.user.id.trim(),
                        name: formData.user.name.trim(),
                        password: formData.user.password,
                        email: formData.user.email,
                        department_name: selectedDepartmentEmployee,
                        role: "Inhaber",
                        position: selectedPositionEmployee,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`
                        }
                    }
                );

                getAllUsers()
            } catch (err) {
                alert(err.response?.data?.message)
            } finally {
                setLoading(false);
                setAddEmployee(false)
                setFormData({
                    user: {
                        id: '',
                        name: '',
                        password: '',
                        email: '',
                    },
                })
                setSelectedPositionEmployee("")
                setSelectedDepartmentEmployee("")
                setSelectedRoleUser("")
                setPositionFormMenuState(false)

            }
        }
        //CREATE MANAGER BY ADMIN
        if (userObject?.role === 'Admin' && selectedRoleUser === 'Manager') {
            try {
                const { data } = await axios.post(
                    `${baseUrl}/api/auth/manage-admin/register-manager`,
                    {
                        id: formData.user.id.trim(),
                        name: formData.user.name.trim(),
                        password: formData.user.password,
                        email: formData.user.email,
                        department_name: selectedDepartmentEmployee,
                        role: "Manager",
                        position: selectedPositionEmployee,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`
                        }
                    }
                );
                getAllUsers()
            } catch (err) {
                alert(err.response?.data?.message)
            } finally {
                setLoading(false);
                setAddEmployee(false)
                setFormData({
                    user: {
                        id: '',
                        name: '',
                        password: '',
                        email: '',
                    },
                })
                setSelectedPositionEmployee("")
                setSelectedDepartmentEmployee("")
                setSelectedRoleUser("")
                setPositionFormMenuState(false)
            }
        }
    };

    const handleDepartmetnnMenu = () => {
        setDepartmentMenu(!departmentMenu)
        setPositionMenu(false)
        setRoleMenu(false)
    }

    const handleRoleMenu = () => {
        setRoleMenu(!roleMenu)
        setPositionMenu(false)
        setDepartmentMenu(false)
    }

    const handleChangeSelectedDepartment = (item) => {
        setSelectedDepartment(item)
    }

    const handleChangeSelectedRole = (item) => {
        setSelectedRole(item)
    }

    // const SeacrhTyoe = async (department, details, role) => {
    //     //----------------------------------------------------------------SEARCH BY ADMIN----------------------------------------------------------------//
    //     if (userObject.role === 'Admin') {
    //         // setCurrentPage(1)
    //         setUserList([])
    //         setLoadingSearching(true)
    //         try {
    //             const response = await axios.get(`${baseUrl}/api/admin/manage-all/search-specific?department=${department}&details=${details}&role=${role}`, {
    //                 headers: {
    //                     Authorization: `Bearer ${localStorage.getItem("token")}`
    //                 }
    //             });
    //             // console.log(query);
    //             setUserList(response.data.message);
    //             setTotalPages(response?.data?.pagination?.totalRecords)
    //             setLoadingSearching(false)
    //         } catch (err) {
    //             // if(error.)
    //             setUserList([])
    //             setLoadingSearching(false)
    //             alert(err.response?.data?.message)
    //             // console.error('Error fetching data:', error);
    //         }
    //     }
    //     //----------------------------------------------------------------SEARCH BY INHABER----------------------------------------------------------------//

    // };

    const handleSeacrh = async () => {
        // setCurrentPage(1)
        if (userObject?.role === 'Admin') {
            // setCurrentPage(1)
            setUserList([])
            setLoadingSearching(true)
            try {
                const response = await axios.get(`${baseUrl}/api/admin/manage-all/search-specific?department=${selectedDepartment}&details=${inputSearch}&role=${selectedRole}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                });
                // console.log(query);
                setUserList(response.data.message);
                setTotalPages(response?.data?.pagination?.totalRecords)
                setLoadingSearching(false)
            } catch (err) {
                // if(error.)
                setUserList([])
                setLoadingSearching(false)
                alert(err.response?.data?.message)
                // console.error('Error fetching data:', error);
            }
            // if (inputSearch !== "" && selectedDepartment === "Abteilung auswählen" && selectedRole === "Wählen Sie Rolle aus") {
            //     SeacrhTyoe("", inputSearch, "")
            // }
            // if (inputSearch === "" && selectedDepartment !== "Abteilung auswählen" && selectedRole === "Wählen Sie Rolle aus") {
            //     SeacrhTyoe(selectedDepartment, "", "")
            // }
            // if (inputSearch === "" && selectedDepartment === "Abteilung auswählen" && selectedRole !== "Wählen Sie Rolle aus") {
            //     SeacrhTyoe("", "", selectedRole)
            // }
            // if (inputSearch !== "" && selectedDepartment !== "Abteilung auswählen" && selectedRole !== "Wählen Sie Rolle aus") {
            //     SeacrhTyoe(selectedRole, selectedDepartment, inputSearch)
            // }
            // if (inputSearch === "" && selectedDepartment !== "Abteilung auswählen" && selectedRole !== "Wählen Sie Rolle aus") {
            //     SeacrhTyoe(selectedDepartment, "", selectedRole)
            // }
            // if (inputSearch === "" && selectedDepartment === "Abteilung auswählen" && selectedRole === "Wählen Sie Rolle aus") {
            //     getAllUsers()
            // }
            // setTimeout(() => {
            //     setSelectedDepartment("Abteilung auswählen")
            //     setSelectedRole("Wählen Sie Rolle aus")
            //     setSelectedPosition("Select Position")
            // }, 2000);
        }
        if (userObject.role === 'Inhaber') {
            setLoadingSearching(true)
            setUserList([])
            try {
                const response = await axios.get(`${baseUrl}/api/inhaber/manage-employee/search-specific?inhaber_name=${userObject?.name}&department=${selectedDepartment}&details=${inputSearch}&role=${selectedRole}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                });
                // console.log(query);
                setUserList(response.data.message);
                setTotalPages(response?.data?.pagination?.totalRecords)
                setLoadingSearching(false)
            } catch (err) {
                // if(error.)
                setUserList([])
                setLoadingSearching(false)
                alert(err.response?.data?.message)
                // console.error('Error fetching data:', error);
            }
        }
        if (userObject.role === 'Manager') {
            setLoadingSearching(true)
            setUserList([])
            try {
                const response = await axios.get(`${baseUrl}/api/manager/manage-employee/search-specific?manager_name=${userObject?.name}&department=${selectedDepartment}&details=${inputSearch}&role=${selectedRole}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                });
                // console.log(query);
                setUserList(response.data.message);
                setTotalPages(response?.data?.pagination?.totalRecords)
                setLoadingSearching(false)
            } catch (err) {
                // if(error.)
                setUserList([])
                setLoadingSearching(false)
                alert(err.response?.data?.message)
                // console.error('Error fetching data:', error);
            }
        }
    }

    const handleExportEmloyeeFile = async () => {
        setLoading(true);
        if (userObject?.role === "Admin") {
            try {
                setLoading(true);

                const { data } = await axios.post(
                    `${baseUrl}/api/admin/manage-xlsx/employee-data`,
                    {
                        employees: userList
                    },
                    {
                        responseType: "arraybuffer",
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`
                        }
                    }
                );

                const blob = new Blob([data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
                const link = document.createElement("a");

                link.href = window.URL.createObjectURL(blob);
                link.download = "employee_data.xlsx";

                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } catch (err) {
                alert(err.response?.data?.message)
            } finally {
                setLoading(false);
                setExportEmployee(false)
            }
        }
        if (userObject?.role === "Inhaber") {
            try {
                setLoading(true);

                const { data } = await axios.post(
                    `${baseUrl}/api/inhaber/manage-xlsx/employee-data`,
                    {
                        employees: userList
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
                link.download = "employee_data.xlsx";

                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } catch (err) {
                alert(err.response?.data?.message)
            } finally {
                setLoading(false);
                setExportEmployee(false)
            }
        }

    }
    const getAllUsers = async () => {
        setLoadingSearching(true);
        setUserList([]);
        try {
            if (userObject?.role === 'Admin') {
                const response = await axios.get(`${baseUrl}/api/admin/manage-all/search-specific?page=${currentPage}&limit=${pageSize}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                });
                setUserList(response.data.message);
                setTotalPages(response?.data?.pagination?.totalRecords)
            }
            if (userObject?.role === 'Inhaber') {
                // console.log("sdfs");
                const response = await axios.get(`${baseUrl}/api/inhaber/manage-employee/search-specific?inhaber_name=${userObject?.name}&page=${currentPage}&limit=${pageSize}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                }
                );
                setUserList(response.data.message);
                setTotalPages(response?.data?.pagination?.totalRecords)
            }
            if (userObject?.role === 'Manager') {
                const response = await axios.get(`${baseUrl}/api/manager/manage-employee/search-specific?manager_name=${userObject?.name}&page=${currentPage}&limit=${pageSize}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                });
                setUserList(response.data.message);
                setTotalPages(response?.data?.pagination?.totalRecords)
            }

        } catch (err) {
            alert(err.response?.data?.message)
        }
        finally {
            setLoadingSearching(false);
        }
    };

    useEffect(() => {

        if (selectedRoleUser === "Employee" || selectedRoleUser === "Inhaber" || selectedRoleUser === "Manager") {
            setPositionFormMenuState(true)
        }

        // if (selectedRoleUser !== "Employee") {
        //     setPositionFormMenuState(false)

        // }

        const getAllDepartments = async () => {
            if (userObject?.role === "Admin") {
                try {
                    const response = await axios.get(`${baseUrl}/api/admin/manage-department/get-all`, {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`
                        }
                    });
                    setDepartmentList(response.data);
                } catch (err) {
                    alert(err.response?.data?.message)
                }
            }
        };
        getAllDepartments()
    }, [selectedRoleUser, userObject?.role]);

    useEffect(() => {
        // setCurrentPage(1)
        getAllUsers();
    }, [userObject?.role, userObject?.name, currentPage, pageSize])
    useEffect(() => {
        if (userObject?.role === 'Admin') {
            setCheckRole(true)
            setCheckAdmin(true)
            setCheckInhaber(false)
            setCheckManager(false)
        }

        if (userObject?.role === 'Inhaber') {
            setCheckRole(false)
            setCheckAdmin(false)
            setCheckInhaber(true)
            setCheckManager(false)
        }

        if (userObject?.role === 'Manager') {
            setCheckRole(false)
            setCheckAdmin(false)
            setCheckInhaber(false)
            setCheckManager(true)
        }
        if (userObject?.role === 'Admin' || userObject?.role === 'Inhaber') {
            setExportState(true)
        }
        if (userObject?.role === 'Inhaber' || userObject?.role === 'Admin') {
            setCheckAdminAndInhaber(true)
        }
        if (userObject?.role == "Inhaber" || userObject?.role == "Manager") {
            const arrayFilter = userObject?.department?.map((item => item.name))
            setDepartmentInhaberOrManager(arrayFilter)
            console.log("arrayFilter", departmentInhaberOrManager);
        }
    }, [userList, userObject?.role])
    return (
        <>
            <div className="relative ml-[260px] h-auto p-5 flex flex-col font-Changa text-textColor gap-5 justify-center">
                <div className="flex flex-row items-center justify-between">
                    <div>
                        <h1 className="font-bold text-3xl">Employees</h1>
                        <div className="flex flex-row">
                            <Link className="text-xl font-semibold leading-6 hover:underline" to="/dashboard">Dashboard</Link>
                            <span className="text-[#6c757d] font-xl">/ Employees</span>
                        </div>
                    </div>
                    <div className="flex flex-row px-4 gap-4">
                        <button onClick={() => setAddEmployee(!addEmployee)} className="bg-buttonColor2 text-white text-base flex flex-row gap-1 justify-center items-center border border-solid p-2 rounded-md hover:bg-emerald-800">
                            <svg style={{ width: '14px', height: '16px' }} aria-hidden="true" focusable="false" data-prefix="fas" data-icon="plus" class="svg-inline--fa fa-plus " role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"></path></svg>
                            Mitarbeiter hinzufügen
                        </button>
                        {exportState && (<button onClick={() => setExportEmployee(!exportEmployee)} className="bg-buttonColor1 text-white text-base flex flex-row gap-1 justify-center items-center border border-solid p-2 rounded-md hover:bg-cyan-800">
                            <svg style={{ width: '14px', height: '16px' }} aria-hidden="true" focusable="false" data-prefix="fas" data-icon="plus" class="svg-inline--fa fa-plus " role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"></path></svg>
                            Exportdatei
                        </button>)}
                    </div>
                </div>
                <div className="border border-solid border-t-[#6c757d]"></div>

                {/* //---------------------------------------------------------------- SEARCH ----------------------------------------------------------------// */}
                <div className="z-10 flex flex-row mt-10 justify-between h-[50px]">
                    <input
                        className="w-1/4 border-[#d9d9d9] text-[#6c757d] rounded-[6px] hover:border-[#4096ff] focus:border-[#4096ff] placeholder:text-placeholderTextColorw-1/4 text-base px-4 py-3 placeholder:text-placeholderTextColor"
                        type="text"
                        placeholder="Suchen nach name, ID, position"
                        value={inputSearch}
                        onChange={(e) => setInputSearch(e.target.value)}
                    />
                    {checkAdminAndInhaber && (
                        // <div
                        //     onClick={handleRoleMenu}
                        //     className="w-1/5 h-[50px] text-base cursor-pointer">
                        //     <div className="flex flex-col w-full py-3 px-2 border border-solid text-placeholderTextColorw-2/3 text-base border-[#d9d9d9] text-[#6c757d] rounded-[6px] hover:border-[#4096ff] focus:border-[#4096ff] placeholder:text-placeholderTextColor">
                        //         <div className="flex flex-row items-center justify-around w-full">
                        //             <div className="ml-4">{selectedRole}</div>
                        //             <div className={`w-4 h-4 flex justify-center items-center ${roleMenu ? "rotate-180" : ""}`}>
                        //                 <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="caret-down" class="svg-inline--fa fa-caret-down fa-rotate-180 " role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" style={{ color: "rgb(220, 220, 220)" }}><path fill="currentColor" d="M137.4 374.6c12.5 12.5 32.8 12.5 45.3 0l128-128c9.2-9.2 11.9-22.9 6.9-34.9s-16.6-19.8-29.6-19.8L32 192c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9l128 128z"></path></svg>
                        //             </div>
                        //         </div>
                        //     </div>

                        //     {roleMenu && (<div className="text-black bg-placeholderTextColor border border-solid border-placeholderTextColor border-t-black flex flex-col justify-center gap-3 px-2 py-3 items-center w-full overflow-y-scroll max-h-[200px]">
                        //         {roleList.map(({ index, name }) => {
                        //             return <div onClick={() => handleChangeSelectedRole(name)} className="w-full text-center hover:underline">{name}</div>
                        //         })}
                        //     </div>)}
                        // </div>
                        <div className="w-1/5">
                            <select
                                id="role-search"
                                name="role-search"
                                className="w-full cursor-pointer border-[#d9d9d9] text-[#6c757d] rounded-[6px] h-[45px] text-base px-4 py-3 placeholder:text-placeholderTextColor hover:border-[#4096ff] focus:border-[#4096ff]"
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                                required
                            >
                                <option value="" disabled className='italic text-sm'>Wählen Sie Rolle aus</option>
                                {roleList?.map(({ name }, index) => (
                                    <option className='text-sm text-textColor w-full' key={index} value={name}>
                                        {name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* {checkRole && ( */}
                    <div className="w-1/5">

                        {/* //     onClick={handleDepartmetnnMenu}
                        //     className="w-1/5 h-[50px] text-base cursor-pointer">
                        //     <div className="flex flex-col w-full py-3 px-2 text-base border-[#d9d9d9] text-[#6c757d] rounded-[6px] hover:border-[#4096ff] focus:border-[#4096ff] placeholder:text-placeholderTextColor border border-solid">
                        //         <div className="flex flex-row items-center justify-around w-full">
                        //             <div className="ml-4">{selectedDepartment}</div>
                        //             <div className={`w-4 h-4 flex justify-center items-center ${departmentMenu ? "rotate-180" : ""}`}>
                        //                 <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="caret-down" class="svg-inline--fa fa-caret-down fa-rotate-180 " role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" style={{ color: "rgb(220, 220, 220)" }}><path fill="currentColor" d="M137.4 374.6c12.5 12.5 32.8 12.5 45.3 0l128-128c9.2-9.2 11.9-22.9 6.9-34.9s-16.6-19.8-29.6-19.8L32 192c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9l128 128z"></path></svg>
                        //             </div>
                        //         </div>
                        //     </div>

                        //     {departmentMenu && (<div className="text-black bg-placeholderTextColor border border-solid border-placeholderTextColor border-t-black flex flex-col gap-3 px-2 py-3 items-center w-full overflow-y-scroll max-h-[200px]">
                        //         {departmentList.map(({ index, name }) => {
                        //             return <div onClick={() => handleChangeSelectedDepartment(name)} className="w-full text-center hover:underline">{name}</div>
                        //         })}
                        //     </div>)} */}
                        <select
                            id="department-search"
                            name="department-search"
                            className="w-full cursor-pointer border-[#d9d9d9] text-[#6c757d] rounded-[6px] h-[45px] text-base px-4 py-3 placeholder:text-placeholderTextColor hover:border-[#4096ff] focus:border-[#4096ff]"
                            value={selectedDepartment}
                            onChange={(e) => setSelectedDepartment(e.target.value)}
                            required
                        >
                            <option value="" disabled className='italic text-sm'>Abteilung auswählen</option>
                            {departmentList?.map(({ name }, index) => (
                                <option className='text-sm text-textColor w-full' key={index} value={name}>
                                    {name}
                                </option>
                            ))}
                        </select>
                    </div>
                    {/* )} */}

                    <div
                        onClick={handleSeacrh}
                        className="bg-buttonColor2 text-white text-base flex flex-row gap-1 justify-center items-center border border-solid p-2 rounded-md cursor-pointer hover:bg-emerald-700 w-1/6">
                        <button className="search-btn">Suchen</button>
                    </div>
                </div>

                {/* //---------------------------------------------------------------- USER LIST ----------------------------------------------------------------// */}
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
                                    <span className="table-title-email">Email</span>
                                </th>
                                <th className="p-2 text-left">
                                    <span className="table-title-role">Rolle</span>
                                </th>
                                <th className="p-2 text-left">
                                    <span className="table-title-role">Filiale</span>
                                </th>
                                <th className="p-2 text-left">
                                    <span className="table-title-role"></span>
                                </th>
                                <th className="p-2 text-left">
                                    <span className="table-title-role">Position</span>
                                </th>
                                <th className="p-2 text-left">
                                    <span className="table-title-role"></span>
                                </th>
                                <th className="p-2 text-left mr-2">
                                    <span className="table-title-status">Status</span>
                                </th>
                            </tr>
                        </thead>
                        {Array.isArray(userList) && userList?.length === 0 ? (
                            <div className="no-result-text text-center">NO RESULT</div>
                        ) : (
                            <tbody className="tbody">
                                {userList?.map(({ id, name, email, status, department, department_name, role, position }) => (
                                    <EmployeeItem
                                        key={id}
                                        name={name}
                                        id={id}
                                        email={email}
                                        status={status}
                                        department={department}
                                        department_name={department_name}
                                        role={role}
                                        position={position}
                                        checkAdmin={checkAdmin}
                                        checkInhaber={checkInhaber}
                                        checkManager={checkManager}
                                    />
                                ))}
                            </tbody>)}
                    </table>
                </div>
                {loadingSearching && (<div className="flex w-full h-full items-center justify-center">
                    <div className="loader_search"></div>
                </div>)}

                <div className="flex flex-wrap gap-2 justify-center items-center mt-4 mb-4">
                    <Pagination
                        current={currentPage}
                        pageSize={pageSize}
                        total={totalPages}
                        onChange={handlePageChange}
                        className="text-base"
                    />
                </div>
                {/* add Employee */}
                {addEmployee && (<div className="fixed top-0 bottom-0 right-0 left-0 z-20 font-Changa">
                    <div
                        onClick={() => setAddEmployee(false)}
                        className="absolute top-0 bottom-0 right-0 left-0 bg-[rgba(0,0,0,.45)] cursor-pointer"></div>
                    <div className="absolute w-[500px] top-0 right-0 bottom-0 z-30 bg-white overflow-y-auto">
                        <div className="w-full h-full">
                            <div className="flex flex-col mt-8">
                                <div className="flex flex-row justify-between px-8 items-center">
                                    <div className="font-bold text-xl">Create Employee</div>
                                    <div
                                        onClick={() => setAddEmployee(false)}
                                        className="text-lg border border-solid border-[rgba(0,0,0,.45)] py-1 px-3 rounded-full cursor-pointer">x</div>
                                </div>
                                <div className="w-full border border-solid border-t-[rgba(0,0,0,.45)] mt-4"></div>
                                <div className="flex flex-col px-8 w-full mt-7o">
                                    <form
                                        className="flex flex-col gap-6 w-full justify-center items-center"
                                        onSubmit={handleSubmit}>
                                        {loading && (<div className="absolute flex w-full h-full items-center justify-center">
                                            <div className="loader_search"></div>
                                        </div>)}
                                        <div className="w-full h-auto flex flex-col gap-2 mt-4">
                                            <div className="flex flex-row gap-2">
                                                <span className="text-rose-500">*</span>
                                                <span className="">Employee's ID</span>
                                            </div>
                                            <input
                                                type="text"
                                                name="id"
                                                className="border-[#d9d9d9] text-[#6c757d] rounded-[6px] h-[45px] w-full text-base px-4 py-3 placeholder:text-placeholderTextColor hover:border-[#4096ff] focus:border-[#4096ff]"
                                                required
                                                value={formData.user.id}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="w-full h-auto flex flex-col gap-2">
                                            <div className="flex flex-row gap-2">
                                                <span className="text-rose-500">*</span>
                                                <span className="">Name</span>
                                            </div>
                                            <input
                                                type="text"
                                                name="name"
                                                className="border-[#d9d9d9] text-[#6c757d] rounded-[6px] h-[45px] w-full text-base px-4 py-3 placeholder:text-placeholderTextColor hover:border-[#4096ff] focus:border-[#4096ff]"
                                                required
                                                value={formData.user.name}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="w-full h-auto flex flex-col gap-2">
                                            <div className="flex flex-row gap-2">
                                                <span className="text-rose-500">*</span>
                                                <span className="">Password</span>
                                            </div>
                                            <input
                                                type="text"
                                                name="password"
                                                className="border-[#d9d9d9] text-[#6c757d] rounded-[6px] h-[45px] w-full text-base px-4 py-3 placeholder:text-placeholderTextColor hover:border-[#4096ff] focus:border-[#4096ff]"
                                                required
                                                value={formData.user.password}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="w-full h-auto flex flex-col gap-2">
                                            <div className="flex flex-row gap-2">
                                                <span className="text-rose-500">*</span>
                                                <span className="">Email</span>
                                            </div>
                                            <input
                                                type="email"
                                                className="border-[#d9d9d9] text-[#6c757d] rounded-[6px] h-[45px] w-full text-base px-4 py-3 placeholder:text-placeholderTextColor hover:border-[#4096ff] focus:border-[#4096ff]"
                                                name="email"
                                                required
                                                value={formData.user.email}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        {checkAdmin && (<div className="w-full flex flex-col gap-2">
                                            <div className="flex flex-row gap-2">
                                                <span className="text-rose-500">*</span>
                                                <span className="">Filiale</span>
                                            </div>
                                            <div className="w-full flex flex-row gap-8 justify-between">
                                                <div className="flex flex-col gap-2">
                                                    {departmentList?.slice(0, Math.ceil(departmentList.length / 2)).map((item, index) => (
                                                        <div key={index} className="flex items-center gap-2">
                                                            <input
                                                                type="checkbox"
                                                                id={`department${index}`}
                                                                name={`department${index}`}
                                                                value={item.name}
                                                                checked={selectedDepartmentEmployee.includes(item.name)}
                                                                onChange={(e) => {
                                                                    const isChecked = e.target.checked;
                                                                    setSelectedDepartmentEmployee((prevDepartments) =>
                                                                        isChecked
                                                                            ? [...prevDepartments, item.name]
                                                                            : prevDepartments.filter((pos) => pos !== item.name)
                                                                    );
                                                                }}
                                                            />
                                                            <label htmlFor={`department_${index}`} className="text-sm text-textColor">
                                                                {item.name}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    {departmentList?.slice(Math.ceil(departmentList.length / 2)).map((item, index) => (
                                                        <div key={index} className="flex items-center gap-2">
                                                            <input
                                                                type="checkbox"
                                                                id={`department${index}`}
                                                                name={`department${index}`}
                                                                value={item.name}
                                                                checked={selectedDepartmentEmployee.includes(item.name)}
                                                                onChange={(e) => {
                                                                    const isChecked = e.target.checked;
                                                                    setSelectedDepartmentEmployee((prevDepartments) =>
                                                                        isChecked
                                                                            ? [...prevDepartments, item.name]
                                                                            : prevDepartments.filter((pos) => pos !== item.name)
                                                                    );
                                                                }}
                                                            />
                                                            <label htmlFor={`department_${index}`} className="text-sm text-textColor">
                                                                {item.name}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>)}
                                        {checkInhaber && (<div className="w-full flex flex-col gap-2">
                                            <div className="flex flex-row gap-2">
                                                <span className="text-rose-500">*</span>
                                                <span className="">Filiale</span>
                                            </div>
                                            <div className="w-full flex flex-row gap-8 justify-between">
                                                <div className="flex flex-col gap-2">
                                                    {departmentInhaberOrManager?.slice(0, Math.ceil(departmentInhaberOrManager.length / 2)).map((item, index) => (
                                                        <div key={index} className="flex items-center gap-2">
                                                            <input
                                                                type="checkbox"
                                                                id={`department${index}`}
                                                                name={`department${index}`}
                                                                value={item}
                                                                checked={selectedDepartmentEmployee.includes(item)}
                                                                onChange={(e) => {
                                                                    const isChecked = e.target.checked;
                                                                    setSelectedDepartmentEmployee((prevDepartments) =>
                                                                        isChecked
                                                                            ? [...prevDepartments, item]
                                                                            : prevDepartments.filter((pos) => pos !== item)
                                                                    );
                                                                }}
                                                            />
                                                            <label htmlFor={`department_${index}`} className="text-sm text-textColor">
                                                                {item}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    {departmentInhaberOrManager?.slice(Math.ceil(departmentInhaberOrManager.length / 2)).map((item, index) => (
                                                        <div key={index} className="flex items-center gap-2">
                                                            <input
                                                                type="checkbox"
                                                                id={`department${index}`}
                                                                name={`department${index}`}
                                                                value={item}
                                                                checked={selectedDepartmentEmployee.includes(item)}
                                                                onChange={(e) => {
                                                                    const isChecked = e.target.checked;
                                                                    setSelectedDepartmentEmployee((prevDepartments) =>
                                                                        isChecked
                                                                            ? [...prevDepartments, item]
                                                                            : prevDepartments.filter((pos) => pos !== item)
                                                                    );
                                                                }}
                                                            />
                                                            <label htmlFor={`department_${index}`} className="text-sm text-textColor">
                                                                {item}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>)}
                                        {checkManager && (<div className="w-full flex flex-col gap-2">
                                            <div className="flex flex-row gap-2">
                                                <span className="text-rose-500">*</span>
                                                <span className="">Filiale</span>
                                            </div>
                                            <div className="w-full flex flex-row gap-8 justify-between">
                                                <div className="flex flex-col gap-2">
                                                    {departmentInhaberOrManager?.slice(0, Math.ceil(departmentInhaberOrManager.length / 2)).map((item, index) => (
                                                        <div key={index} className="flex items-center gap-2">
                                                            <input
                                                                type="checkbox"
                                                                id={`department${index}`}
                                                                name={`department${index}`}
                                                                value={item}
                                                                checked={selectedDepartmentEmployee.includes(item)}
                                                                onChange={(e) => {
                                                                    const isChecked = e.target.checked;
                                                                    setSelectedDepartmentEmployee((prevPositions) =>
                                                                        isChecked
                                                                            ? [...prevPositions, item]
                                                                            : prevPositions.filter((pos) => pos !== item)
                                                                    );
                                                                }}
                                                            />
                                                            <label htmlFor={`position_${index}`} className="text-sm text-textColor">
                                                                {item}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    {departmentInhaberOrManager?.slice(Math.ceil(departmentInhaberOrManager.length / 2)).map((item, index) => (
                                                        <div key={index} className="flex items-center gap-2">
                                                            <input
                                                                type="checkbox"
                                                                id={`department${index}`}
                                                                name={`department${index}`}
                                                                value={item}
                                                                checked={selectedDepartmentEmployee.includes(item)}
                                                                onChange={(e) => {
                                                                    const isChecked = e.target.checked;
                                                                    setSelectedDepartmentEmployee((prevPositions) =>
                                                                        isChecked
                                                                            ? [...prevPositions, item]
                                                                            : prevPositions.filter((pos) => pos !== item)
                                                                    );
                                                                }}
                                                            />
                                                            <label htmlFor={`position_${index}`} className="text-sm text-textColor">
                                                                {item}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>)}
                                        {checkAdmin && (<div className="w-full flex flex-col gap-2">
                                            <div className="flex flex-row gap-2">
                                                <span className="text-rose-500">*</span>
                                                <span className="">Rolle</span>
                                            </div>
                                            <select
                                                id="role"
                                                name="role"
                                                className="w-full cursor-pointer border-[#d9d9d9] text-[#6c757d] rounded-[6px] h-[45px] text-base px-4 py-3 placeholder:text-placeholderTextColor hover:border-[#4096ff] focus:border-[#4096ff]"
                                                value={selectedRoleUser}
                                                onChange={(e) => setSelectedRoleUser(e.target.value)}
                                                required
                                            >
                                                <option value="" disabled className='italic text-sm'>Wählen Sie Rolle aus*</option>
                                                {roleList?.map((item, index) => (
                                                    <option className='text-sm text-textColor w-full' key={index} value={item.name}>
                                                        {item.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>)}
                                        {checkInhaber && (<div className="w-full flex flex-col gap-2">
                                            <div className="flex flex-row gap-2">
                                                <span className="text-rose-500">*</span>
                                                <span className="">Rolle</span>
                                            </div>
                                            <select
                                                id="role"
                                                name="role"
                                                className="w-full cursor-pointer border-[#d9d9d9] text-[#6c757d] rounded-[6px] h-[45px] text-base px-4 py-3 placeholder:text-placeholderTextColor hover:border-[#4096ff] focus:border-[#4096ff]"
                                                value={selectedRoleUser}
                                                onChange={(e) => setSelectedRoleUser(e.target.value)}
                                                required
                                            >
                                                <option value="" disabled className='italic text-sm'>Wählen Sie Rolle aus*</option>
                                                {roleListForInhaber?.map((item, index) => (
                                                    <option className='text-sm text-textColor w-full' key={index} value={item.name}>
                                                        {item.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>)}
                                        {checkManager && (<div className="w-full flex flex-col gap-2">
                                            <div className="flex flex-row gap-2">
                                                <span className="text-rose-500">*</span>
                                                <span className="">Rolle</span>
                                            </div>
                                            <select
                                                id="role"
                                                name="role"
                                                className="w-full cursor-pointer border-[#d9d9d9] text-[#6c757d] rounded-[6px] h-[45px] text-base px-4 py-3 placeholder:text-placeholderTextColor hover:border-[#4096ff] focus:border-[#4096ff]"
                                                value={selectedRoleUser}
                                                onChange={(e) => setSelectedRoleUser(e.target.value)}
                                                required
                                            >
                                                <option value="" disabled className='italic text-sm'>Wählen Sie Rolle aus*</option>
                                                {roleListForManager?.map((item, index) => (
                                                    <option className='text-sm text-textColor w-full' key={index} value={item.name}>
                                                        {item.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>)}
                                        {positionFormMenuState && (<div className="w-full flex flex-col gap-2">
                                            <div className="flex flex-row gap-2">
                                                <span className="text-rose-500">*</span>
                                                <span className="">Positions</span>
                                            </div>
                                            <div className="w-full flex flex-row gap-8 justify-between">
                                                <div className="flex flex-col gap-2">
                                                    {positionList?.slice(0, Math.ceil(positionList.length / 2)).map((item, index) => (
                                                        <div key={index} className="flex items-center gap-2">
                                                            <input
                                                                type="checkbox"
                                                                id={`position_${index}`}
                                                                name={`position_${index}`}
                                                                value={item.name}
                                                                checked={selectedPositionEmployee.includes(item.name)}
                                                                onChange={(e) => {
                                                                    const isChecked = e.target.checked;
                                                                    setSelectedPositionEmployee((prevPositions) =>
                                                                        isChecked
                                                                            ? [...prevPositions, item.name]
                                                                            : prevPositions.filter((pos) => pos !== item.name)
                                                                    );
                                                                }}
                                                            />
                                                            <label htmlFor={`position_${index}`} className="text-sm text-textColor">
                                                                {item.name}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    {positionList?.slice(Math.ceil(positionList.length / 2)).map((item, index) => (
                                                        <div key={index} className="flex items-center gap-2">
                                                            <input
                                                                type="checkbox"
                                                                id={`position_${index}`}
                                                                name={`position_${index}`}
                                                                value={item.name}
                                                                checked={selectedPositionEmployee.includes(item.name)}
                                                                onChange={(e) => {
                                                                    const isChecked = e.target.checked;
                                                                    setSelectedPositionEmployee((prevPositions) =>
                                                                        isChecked
                                                                            ? [...prevPositions, item.name]
                                                                            : prevPositions.filter((pos) => pos !== item.name)
                                                                    );
                                                                }}
                                                            />
                                                            <label htmlFor={`position_${index}`} className="text-sm text-textColor">
                                                                {item.name}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>)}
                                        <div
                                            className=" bg-buttonColor2 text-white text-base flex flex-row gap-1 justify-center items-center mb-7 border border-solid py-3 rounded-md cursor-pointer hover:bg-emerald-700 w-full">
                                            <button type="submit" className="w-full">Hinzufügen</button>
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
                    <div className="absolute w-[400px] h-[200px] top-[300px] right-[500px] bottom-0 z-30 bg-white">
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
                                    <span>Do you want to export employee_data.xlsx?</span>
                                    <div className="flex flex-row gap-3">
                                        <button onClick={() => setExportEmployee(false)} type="button" className="w-[100px] bg-rose-800 text-white text-base flex flex-row gap-1 justify-center items-center border border-solid px-2 py-1 rounded-md cursor-pointe">No</button>
                                        <button onClick={handleExportEmloyeeFile} type="button" className="w-[100px] bg-buttonColor2 text-white text-base flex flex-row gap-1 justify-center items-center border border-solid px-2 py-1 rounded-md cursor-pointer">Yes</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>)}
            </div>
        </>
    );
}

export default Employee;

