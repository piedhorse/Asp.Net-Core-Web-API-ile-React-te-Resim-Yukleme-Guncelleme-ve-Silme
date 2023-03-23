import React, { useState, useEffect } from 'react'
import Employee from './Employee'
import axios from "axios";

export default function EmployeeList() {
    const [employeeList, setEmployeeList] = useState([])
    const [recordForEdit, setRecordForEdit] = useState(null)

    useEffect(() => {
        refreshEmployeeList();
    }, [])

    const employeeAPI = (url = 'https://localhost:44334/api/Employee/') => {
        return {
            fetchAll: () => axios.get(url),
            create: newRecord => axios.post(url, newRecord),
            update: (id, updatedRecord) => axios.put(url + id, updatedRecord),
            delete: id => axios.delete(url + id)
        }
    }

    function refreshEmployeeList() {
        employeeAPI().fetchAll()
            .then(res => {
                setEmployeeList(res.data)
            })
            .catch(err => console.log(err))
    }

    const addOrEdit = (formData, onSuccess) => {
        if (formData.get('employeeID') == "0")
            employeeAPI().create(formData)
                .then(res => {
                    onSuccess();
                    refreshEmployeeList();
                })
                .catch(err => console.log(err))
        else
            employeeAPI().update(formData.get('employeeID'), formData)
                .then(res => {
                    onSuccess();
                    refreshEmployeeList();
                })
                .catch(err => console.log(err))

    }

    const showRecordDetails = data => {
        setRecordForEdit(data)
    }

    const onDelete = (e, id) => {
        e.stopPropagation();
        if (window.confirm('Are you sure to delete this record?'))
            employeeAPI().delete(id)
                .then(res => refreshEmployeeList())
                .catch(err => console.log(err))
    }

    const imageCard = data => (
        <div className="card" onClick={() => { showRecordDetails(data) }}>
            <img src={data.imageSrc} className="card-img-top rounded-circle" />
            <div className="card-body">
                <h5>{data.employeeName}</h5>
                <span>{data.occupation}</span> <br />
                <button className="btn btn-light delete-button" onClick={e => onDelete(e, parseInt(data.employeeID))}>
                    <i className="far fa-trash-alt"></i>
                </button>
            </div>
        </div>
    )


    return (
        <div className="row">
            <div className="col-md-12"style={{ backgroundColor: '#ced114'}}>
                <div className="jumbotron jumbotron-fluid py-4"style={{ backgroundColor: '#ced114'}}>
                    <div className="container text-center"style={{ backgroundColor: '#ced114'}}>
                        <h1 className="display-4"style={{ backgroundColor: '#ced114', color:'yellow'}}>Employee Register</h1>
                    </div>
                </div>
            </div>
            <div className="container text-center">
                <p className="lead"></p>
            </div>
            <div className="col-md-4">
                <Employee
                    addOrEdit={addOrEdit}
                    recordForEdit={recordForEdit}
                />
            </div>
            
            <div className="col-md-8" >
                <table>
                    <tbody>
                        {
                            //tr > 3 td
                            [...Array(Math.ceil(employeeList.length / 3))].map((e, i) =>
                                <tr key={i}>
                                    <td>{imageCard(employeeList[3 * i])}</td>
                                    <td>{employeeList[3 * i + 1] ? imageCard(employeeList[3 * i + 1]) : null}</td>
                                    <td>{employeeList[3 * i + 2] ? imageCard(employeeList[3 * i + 2]) : null}</td>
                                </tr>
                            )
                        }
                    </tbody>
                </table>
            </div>
        </div>
    )
}
/*Bu React bileşeni, bir çalışan kaydı oluşturma, düzenleme, silme ve görüntüleme işlemlerini yönetir.

useState ve useEffect React hook'larını kullanır. useState, bileşenin durumu için bir state değişkeni tanımlar ve setState işlevini döndürür. useEffect, bileşenin yüklenmesi veya yeniden çizilmesi gibi olaylara yanıt olarak bir işlev çalıştırır.

Axios, RESTful web hizmetleri çağrıları yapmak için kullanılır. employeeAPI adlı bir yardımcı işlev, RESTful çağrıları örnekler ve Axios'ın özelliklerini kullanarak kaynak URL'sini değiştirebilir.

refreshEmployeeList işlevi, sunucudan çalışan kayıtlarını alır ve setEmployeeList ile bileşenin durumu olarak ayarlar.

addOrEdit işlevi, çalışan kaydı oluşturma veya güncelleme işlemini gerçekleştirir. FormData nesnesi, çalışan kaydı için kullanıcı girdilerini içerir.

onDelete işlevi, kullanıcıdan bir kaydı silmek isteyip istemediğini onaylamasını ister ve daha sonra sunucuya bir DELETE isteği gönderir.

imageCard işlevi, çalışanların kartlarını görüntülemek için kullanılır. Kart, çalışanın resmini, adını, iş tanımını ve silme düğmesini içerir.

Son olarak, bileşen bir jumbotron başlığı, bir çalışan formu ve bir çalışan kartları tablosu içerir. Tablo, üç sütuna ve üçüncü sütunun dolu olmadığı ek sıralara sahip çalışan kartlarını görüntüler. */