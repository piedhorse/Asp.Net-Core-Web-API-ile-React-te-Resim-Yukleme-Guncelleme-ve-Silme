import React, { useState, useEffect } from 'react'

const defaultImageSrc = '/img/3135715.png'

const initialFieldValues = {
    employeeID: 0,
    employeeName: '',
    occupation: '',
    imageName: '',
    imageSrc: defaultImageSrc,
    imageFile: null
}

export default function Employee(props) {

    const { addOrEdit, recordForEdit } = props

    const [values, setValues] = useState(initialFieldValues)
    const [errors, setErrors] = useState({})


    useEffect(() => {
        if (recordForEdit != null)
            setValues(recordForEdit);
    }, [recordForEdit])

    const handleInputChange = e => {
        const { name, value } = e.target;
        setValues({
            ...values,
            [name]: value
        })
    }

    const showPreview = e => {
        if (e.target.files && e.target.files[0]) {
            let imageFile = e.target.files[0];
            const reader = new FileReader();
            reader.onload = x => {
                setValues({
                    ...values,
                    imageFile,
                    imageSrc: x.target.result
                })
            }
            reader.readAsDataURL(imageFile)
        }
        else {
            setValues({
                ...values,
                imageFile: null,
                imageSrc: defaultImageSrc
            })
        }
    }

    const validate = () => {
        let temp = {}
        temp.employeeName = values.employeeName == "" ? false : true;
        temp.imageSrc = values.imageSrc == defaultImageSrc ? false : true;
        setErrors(temp)
        return Object.values(temp).every(x => x == true)
    }

    const resetForm = () => {
        setValues(initialFieldValues)
        document.getElementById('image-uploader').value = null;
        setErrors({})
    }

    const handleFormSubmit = e => {
        e.preventDefault()
        if (validate()) {
            const formData = new FormData()
            formData.append('employeeID', values.employeeID)
            formData.append('employeeName', values.employeeName)
            formData.append('occupation', values.occupation)
            formData.append('imageName', values.imageName)
            formData.append('imageFile', values.imageFile)
            addOrEdit(formData, resetForm)
        }
    }

    const applyErrorClass = field => ((field in errors && errors[field] == false) ? ' invalid-field' : '')

    return (
        <>
            <div className="container text-center">
                <p className="lead"></p>
            </div>
            <form autoComplete="off" noValidate onSubmit={handleFormSubmit}>
                <div className="card"style={{ backgroundColor: '#ced114'}}>
                    <img src={values.imageSrc} className="card-img-top" />
                    <div className="card-body">
                        <div className="form-group">
                            <input type="file" accept="image/*" className={"form-control-file" + applyErrorClass('imageSrc')}
                                onChange={showPreview} id="image-uploader" />
                        </div>
                        <div className="form-group"  style={{ backgroundColor: '#ced114'}} >
                            <input className={"form-control" + applyErrorClass('employeeName')} placeholder="Employee Name" name="employeeName"
                                value={values.employeeName}
                                onChange={handleInputChange} />
                        </div>
                        <div className="form-group">
                            <input className="form-control" placeholder="Occupation" name="occupation"
                                value={values.occupation}
                                onChange={handleInputChange} />
                        </div>
                        <div className="form-group text-center">
                            <button type="submit" className="btn btn-light" style={{ color: '#ced114'}} >Submit</button>
                        </div>
                    </div>
                </div>
            </form>
        </>
    )
}
/*Form, kullanıcının bir çalışan eklemesine veya düzenlemesine olanak tanır. Bileşen, bir resim yükleyebileceğiniz, çalışan adı ve işi hakkında bilgi girebileceğiniz bir form sunar. Form, resim yükleme alanı ve iki metin girişi alanından oluşur.

Birçok değişken kullanılır. defaultImageSrc değişkeni, varsayılan resim yolunu tutar. initialFieldValues değişkeni, bileşenin ilk durumunda kullanılacak başlangıç ​​değerlerini içerir. useState kullanılarak, bileşen içinde değerlerin durumları takip edilir.

useEffect fonksiyonu, bileşenin yüklenmesi sırasında kullanılır ve recordForEdit değişkeni değiştiğinde, bileşenin yeniden yüklenmesini tetikler ve setValues fonksiyonu ile values değişkeni güncellenir.

handleInputChange fonksiyonu, metin girişi alanlarının değiştirilmesi durumunda çağrılır. Bu fonksiyon, e.target.name ve e.target.value kullanarak değişen alanın adını ve değerini yakalar ve setValues fonksiyonunu kullanarak values değişkenini günceller.

showPreview fonksiyonu, resim yükleme alanının değiştirilmesi durumunda çağrılır. Bu fonksiyon, seçilen dosyanın yolunu imageFile değişkenine kaydeder ve FileReader nesnesi kullanarak dosyanın önizlemesini oluşturur ve imageSrc değişkenini günceller.

validate fonksiyonu, formun doğruluğunu doğrular. Bu fonksiyon, values değişkeninin uygun şekilde doldurulduğundan emin olmak için kullanılır. setErrors fonksiyonu, errors değişkenini günceller ve resetForm fonksiyonu, formu sıfırlar ve errors değişkenini temizler.

handleFormSubmit fonksiyonu, formun gönderilmesi durumunda çağrılır. Bu fonksiyon, FormData nesnesi kullanarak form verilerini alır ve addOrEdit fonksiyonunu çağırarak verileri sunucuya gönderir.

applyErrorClass fonksiyonu, hatalı alanlara invalid-field sınıfını uygular ve böylece bu alanların hata ile gösterilmesini sağlar.

Bileşen, bir resim yükleyebileceğiniz, çalışan adı ve işi hakkında bilgi girebileceğiniz bir form sunar. Form, resim yükleme alanı ve iki metin girişi alanından oluşur.*/