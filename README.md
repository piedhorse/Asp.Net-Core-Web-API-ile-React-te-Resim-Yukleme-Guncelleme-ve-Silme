
# Asp.Net Core Web API ile React'te Resim Yükleme,Guncelleme ve Silme
 Asp.Net Core WebAPI ile Reactjs'de görüntülerin nasıl yükleneceğini ele aldim.
 Asp.Net Core web API oluşturuyoruz ve bir entity framework core ile bir SQL server DB oluşturduk. ve ardından görüntü yükleme için bir asp.net Core API denetleyicisi oluşturdum.

Client tarafı uygulamasını Reactjs'de oluşturduk. bunun içinde resim yükleyicili bir form tasarlanmıştır. seçilen görüntü önizlemesi ayrı olarak gösterilir. Form gönderme olayının içinde, seçilen görüntüyü Asp.Net Web API'sine yükledim.


 <a href="https://reactjs.org/" target="_blank" rel="noreferrer"> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original-wordmark.svg" alt="react" width="150" height="150"/> </a>
<a href="https://dotnet.microsoft.com/" target="_blank" rel="noreferrer"> <img src="https://user-images.githubusercontent.com/96746943/226713262-6b077cda-e58f-4a57-b494-d9d951a2528b.jpg" width="50" height="50"/> </a>

## Kullanılan Teknolojiler

**Araclar:** VS Code, Visual Studio, SSMS, Postman
**Client:** Reactjs
**API:** Asp.Net Core WebAPI
  
## Projenin Kaynak kodlari ve yorum satirlari

# EmployeeController
Bu denetleyici, bir veritabanı bağlantısına bağlıdır ve HTTP GET, POST, PUT ve DELETE isteklerini ele alarak çalışan kayıtlarını listelemek, eklemek, güncellemek ve silmek için yöntemler sağlar.

Bu denetleyici, çalışanların resimlerini yükleyebilecekleri bir çalışan formuyla etkileşime geçerek çalışır. Bu form React tarafında tasarlanır ve projenin kök dizininde npx create-react-app komutu kullanılarak oluşturulur.

GET, POST, PUT ve DELETE işlemleri için ilgili yöntemler sağlanmıştır. GET isteği ile mevcut tüm çalışan kayıtları listelenir. PUT isteği, belirtilen bir çalışan kaydını günceller ve ayrıca bir çalışanın profil resmini değiştirmek için kullanılır. POST isteği, yeni bir çalışan kaydı ekler ve çalışanın profil resmini yükler. DELETE isteği, belirtilen bir çalışan kaydını siler.

Ayrıca, çalışan kayıtlarındaki resimlerin yüklenmesi ve silinmesi için SaveImage() ve DeleteImage() adlı iki özel yöntem de sağlanmıştır. Bu yöntemler, çalışan profili resimlerinin yüklenmesi ve silinmesi işlemlerini gerçekleştirir.
```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EmployeeRegisterAPI.Models;
using System.IO;
using Microsoft.AspNetCore.Hosting;

namespace EmployeeRegisterAPI.Controllers
{ 
    [Route("api/[controller]")]
    [ApiController]
    public class EmployeeController : ControllerBase
    {
        private readonly EmployeeDbContext _context;
        private readonly IWebHostEnvironment _hostEnvironment;

        public EmployeeController(EmployeeDbContext context, IWebHostEnvironment hostEnvironment)
        {
         
            _context = context;
            this._hostEnvironment = hostEnvironment;
        }

        // GET: api/EmployeeModels
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EmployeeModel>>> GetEmployees()
        {

            return await _context.Employees
                .Select(x => new EmployeeModel()
                {
                    EmployeeID = x.EmployeeID,
                    EmployeeName = x.EmployeeName,
                    Occupation = x.Occupation,
                    ImageName = x.ImageName,
                    ImageSrc = String.Format("{0}://{1}{2}/Images/{3}", Request.Scheme, Request.Host, Request.PathBase, x.ImageName)
                })
                .ToListAsync();
        }
        // GET: api/Employee/5
        [HttpGet("{id}")]
        public async Task<ActionResult<EmployeeModel>> GetEmployeeModel(int id)
        {
            var employeeModel = await _context.Employees.FindAsync(id);

            if (employeeModel == null)
            {
                return NotFound();
            }

            return employeeModel;
        }

        // PUT: api/Employee/5
        // To protect from overposting attacks, enable the specific properties you want to bind to, for
        // more details, see https://go.microsoft.com/fwlink/?linkid=2123754.
        [HttpPut("{id}")]
        public async Task<IActionResult> PutEmployeeModel(int id, [FromForm] EmployeeModel employeeModel)
        {
            if (id != employeeModel.EmployeeID)
            {
                return BadRequest();
            }

            if (employeeModel.ImageFile != null)
            {
                DeleteImage(employeeModel.ImageName);
                employeeModel.ImageName = await SaveImage(employeeModel.ImageFile);
            }

            _context.Entry(employeeModel).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!EmployeeModelExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/Employee
        // To protect from overposting attacks, enable the specific properties you want to bind to, for
        // more details, see https://go.microsoft.com/fwlink/?linkid=2123754.
        [HttpPost]
        public async Task<ActionResult<EmployeeModel>> PostEmployeeModel([FromForm] EmployeeModel employeeModel)
        {
            employeeModel.ImageName = await SaveImage(employeeModel.ImageFile);
            _context.Employees.Add(employeeModel);
            await _context.SaveChangesAsync();

            return StatusCode(201);
        }

        // DELETE: api/Employee/5
        [HttpDelete("{id}")]
        public async Task<ActionResult<EmployeeModel>> DeleteEmployeeModel(int id)
        {
            var employeeModel = await _context.Employees.FindAsync(id);
            if (employeeModel == null)
            {
                return NotFound();
            }
            DeleteImage(employeeModel.ImageName);
            _context.Employees.Remove(employeeModel);
            await _context.SaveChangesAsync();

            return employeeModel;
        }

        private bool EmployeeModelExists(int id)
        {
            return _context.Employees.Any(e => e.EmployeeID == id);
        }

        [NonAction]
        public async Task<string> SaveImage(IFormFile imageFile)
        {
            string imageName = new String(Path.GetFileNameWithoutExtension(imageFile.FileName).Take(10).ToArray()).Replace(' ', '-');
            imageName = imageName + DateTime.Now.ToString("yymmssfff") + Path.GetExtension(imageFile.FileName);
            var imagePath = Path.Combine(_hostEnvironment.ContentRootPath, "Images", imageName);
            using (var fileStream = new FileStream(imagePath, FileMode.Create))
            {
                await imageFile.CopyToAsync(fileStream);
            }
            return imageName;
        }

        [NonAction]
        public void DeleteImage(string imageName)
        {
            var imagePath = Path.Combine(_hostEnvironment.ContentRootPath, "Images", imageName);
            if (System.IO.File.Exists(imagePath))
                System.IO.File.Delete(imagePath);
        }
    }
}
```
# Employee.js
Form, kullanıcının bir çalışan eklemesine veya düzenlemesine olanak tanır. Bileşen, bir resim yükleyebileceğiniz, çalışan adı ve işi hakkında bilgi girebileceğiniz bir form sunar. Form, resim yükleme alanı ve iki metin girişi alanından oluşur.

Birçok değişken kullanılır. defaultImageSrc değişkeni, varsayılan resim yolunu tutar. initialFieldValues değişkeni, bileşenin ilk durumunda kullanılacak başlangıç ​​değerlerini içerir. useState kullanılarak, bileşen içinde değerlerin durumları takip edilir.

useEffect fonksiyonu, bileşenin yüklenmesi sırasında kullanılır ve recordForEdit değişkeni değiştiğinde, bileşenin yeniden yüklenmesini tetikler ve setValues fonksiyonu ile values değişkeni güncellenir.

handleInputChange fonksiyonu, metin girişi alanlarının değiştirilmesi durumunda çağrılır. Bu fonksiyon, e.target.name ve e.target.value kullanarak değişen alanın adını ve değerini yakalar ve setValues fonksiyonunu kullanarak values değişkenini günceller.

showPreview fonksiyonu, resim yükleme alanının değiştirilmesi durumunda çağrılır. Bu fonksiyon, seçilen dosyanın yolunu imageFile değişkenine kaydeder ve FileReader nesnesi kullanarak dosyanın önizlemesini oluşturur ve imageSrc değişkenini günceller.

validate fonksiyonu, formun doğruluğunu doğrular. Bu fonksiyon, values değişkeninin uygun şekilde doldurulduğundan emin olmak için kullanılır. setErrors fonksiyonu, errors değişkenini günceller ve resetForm fonksiyonu, formu sıfırlar ve errors değişkenini temizler.

handleFormSubmit fonksiyonu, formun gönderilmesi durumunda çağrılır. Bu fonksiyon, FormData nesnesi kullanarak form verilerini alır ve addOrEdit fonksiyonunu çağırarak verileri sunucuya gönderir.

applyErrorClass fonksiyonu, hatalı alanlara invalid-field sınıfını uygular ve böylece bu alanların hata ile gösterilmesini sağlar.

Bileşen, bir resim yükleyebileceğiniz, çalışan adı ve işi hakkında bilgi girebileceğiniz bir form sunar. Form, resim yükleme alanı ve iki metin girişi alanından oluşur.
```javascript

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
```
# EmployeeList.js
Bu React bileşeni, bir çalışan kaydı oluşturma, düzenleme, silme ve görüntüleme işlemlerini yönetir.

useState ve useEffect React hook'larını kullanır. useState, bileşenin durumu için bir state değişkeni tanımlar ve setState işlevini döndürür. useEffect, bileşenin yüklenmesi veya yeniden çizilmesi gibi olaylara yanıt olarak bir işlev çalıştırır.

Axios, RESTful web hizmetleri çağrıları yapmak için kullanılır. employeeAPI adlı bir yardımcı işlev, RESTful çağrıları örnekler ve Axios'ın özelliklerini kullanarak kaynak URL'sini değiştirebilir.

refreshEmployeeList işlevi, sunucudan çalışan kayıtlarını alır ve setEmployeeList ile bileşenin durumu olarak ayarlar.

addOrEdit işlevi, çalışan kaydı oluşturma veya güncelleme işlemini gerçekleştirir. FormData nesnesi, çalışan kaydı için kullanıcı girdilerini içerir.

onDelete işlevi, kullanıcıdan bir kaydı silmek isteyip istemediğini onaylamasını ister ve daha sonra sunucuya bir DELETE isteği gönderir.

imageCard işlevi, çalışanların kartlarını görüntülemek için kullanılır. Kart, çalışanın resmini, adını, iş tanımını ve silme düğmesini içerir.

Son olarak, bileşen bir jumbotron başlığı, bir çalışan formu ve bir çalışan kartları tablosu içerir. Tablo, üç sütuna ve üçüncü sütunun dolu olmadığı ek sıralara sahip çalışan kartlarını görüntüler.
```javascript
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


```
# Projemizin Yapisini olusturalim
# .Net WebApi Projemizi olusturalim 

Projemde .Net Core 6.0 kullaniyorum. Projedeki indirilmesi gereken  Nuget paketleri asagida bulunuyor.

Microsoft.VisualStudio.Web.CodeGeneration.Design
```bash
PM> NuGet\Install-Package Microsoft.VisualStudio.Web.CodeGeneration.Design -Version 6.0.13
```
Microsoft.EntityFrameworkCore 
```bash
PM> NuGet\Install-Package Microsoft.EntityFrameworkCore -Version 7.0.4
```
Microsoft.EntityFrameworkCore.SqlServer
```bash
PM> NuGet\Install-Package Microsoft.EntityFrameworkCore.SqlServer -Version 7.0.4
```
Microsoft.EntityFrameworkCore.Tools 
```bash
PM> NuGet\Install-Package Microsoft.EntityFrameworkCore.Tools -Version 7.0.4
```
Microsoft.AspNetCore.Cors 
```bash
PM> NuGet\Install-Package Microsoft.AspNetCore.Cors -Version 2.2.0
```
## Modelimizi olusturalim
Oncelikle , Models klasorumuze  bir class ekleyelim . EmployeeModel adini verdim.
```csharp
public class EmployeeModel
    {    
        [Key]
        public int EmployeeID { get; set; }

        [Column(TypeName ="nvarchar(50)")]
        public string EmployeeName { get; set; }

        [Column(TypeName = "nvarchar(50)")]
        public string Occupation { get; set; }

        [Column(TypeName = "nvarchar(100)")]
        public string ImageName { get; set; }   
    }
```
Models klasorumuze birde Context class i olusturalim.
```csharp

  using Microsoft.EntityFrameworkCore;

 
namespace EmployeeRegisterAPI.Models
{
    public class EmployeeDbContext: DbContext //burada ef Dbcontext den kalitim aldirdik
    {
        
        public EmployeeDbContext(DbContextOptions<EmployeeDbContext> options):base(options)
        {


        }

        public DbSet<EmployeeModel> Employees { get; set; }
    }
}
```
Startup.cs klasorune gelip ConfigureServices metoduna baglanti dizesi olusturalim.
```csharp
 public void ConfigureServices(IServiceCollection services)
        {
            services.AddControllers();

            //Baglanti dizesini olusturduk ve bu kodda sql server icin bir ConnectionString olusturduk "DevConnection" diye bunula baglanti bilgilerimizi appsettings de belirtecegiz
            services.AddDbContext<EmployeeDbContext>(options => options.UseSqlServer(Configuration.GetConnectionString("DevConnection")));
        }
```
appsettings.json gelelim.Burada baglanti bilgilerini json dosyasina bu sekilde yaziyoruz
```csharp

  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft": "Warning",
      "Microsoft.Hosting.Lifetime": "Information"
    }
  },
  "AllowedHosts": "*",
  //buradan sonraki kod satirlaridir
  "ConnectionStrings": {
    "DevConnection": "Server=LAPTOP-6OAEM3JA; Database=EmployeeDB; Trusted_Connection=True; MultipleActiveResultSets=True;"
  }
}
```
Sonrasinda projemizi build edip paket yoneticisine gidip Migration islemlerimizi gerceklestiriyoruz.
 
 ```bash 
 PM> Add-Migration "InitialCreate"
 ```
 komutu ile Migration olusturalim ve projemizi build edelim.Sonrasinda bu komutu verin

 ```bash 
 PM> update-database
 ```
 
 sonra veritabani olusup olusmadigini mssql den kontrol edelim. 
 
 Ve sonrasinda modelimiz icin bir controller olusturalim API Controller with actions
using EF controller ini kullanacagim .


burya resim gelcek 2 tane 



  Controllerimizi olusturduk modelimizi ve Context dosyamizi belirtip.Controller adimizi belirttik.

  # NOT
  5 AddDb denilen bu  services.AddDbContext<EmployeeDbContext>(options => options.UseSqlServer(Configuration.GetConnectionString("DevConnection"))); islev bu EmployeeController a her istekte bulundugumuzda burada bu calisan controller i icin bir istek olusturacak . EmployeeControlerin yapicisi    public EmployeeController(EmployeeDbContext context) bu koddaki EmployeeDbContext degeri cercevenin kendisi tarafindan otomatik olarak yonetilen bu asp.net dependency injection metodu boylece bu denetleyici icindeki istek simdilik db ile iletisime gececek. 



  # React projemizi olusturalim
 Simdi Client tarafini tasarlayalim calisan profili resimlerini yuklemek icn bir calisan formuyla tepki verecek sekilde tasarlayalim.Proje dizinine react app olusturalim.Bu projemizin dizininden komut istemini acmamiz lazim .

 ```bash 
  npx create-react-app employee-register-client
 ```
Client tarafi icin kulanilmasi gereken oxios komutu

```bash
$ npm install react-axios
```
 Projelerimizin yapisini olusturduk buradan sonrasi icin  repomdaki kodlarimi incelemenizi istiyorum.  Kolay gelsin :)



## API Kullanımı

#### Tüm öğeleri getir

```http
  GET /api/Employee
```

| Parametre | Tip     | Açıklama                |
| :-------- | :------- | :------------------------- |
| `api_key` | `string` | **Gerekli**. API anahtarınız. |

#### Öğeyi getir

```http
  GET /api/Employee/${id}
```

| Parametre | Tip     | Açıklama                       |
| :-------- | :------- | :-------------------------------- |
| `id`      | `string` | **Gerekli**. Çağrılacak öğenin anahtar değeri |

```json
 {"employeeID":3,"employeeName":"piedhorse","occupation":"C#","imageName":"capture_20231646962.jpeg","imageFile":null,"imageSrc":"https://localhost:44334/Images/capture_20231646962.jpeg"}

```

  
