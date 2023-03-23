using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EmployeeRegisterAPI.Models
{
    public class EmployeeModel
    {   //1-Modelimizi olusturduk 
        [Key]
        public int EmployeeID { get; set; }

        [Column(TypeName ="nvarchar(50)")]
        public string EmployeeName { get; set; }

        [Column(TypeName = "nvarchar(50)")]
        public string Occupation { get; set; }

        [Column(TypeName = "nvarchar(100)")]
        public string ImageName { get; set; }

        [NotMapped]
        public IFormFile ImageFile { get; set; }

        [NotMapped]
        public string ImageSrc { get; set; }
        //Pascal(EmployeeName) -> Camel
        //Camel(EmployeeName)-> Pascal
    }
}
