const db = require("../models");
const config = require("../config/auth.config");
const { QueryTypes } = require("sequelize");
const User = db.User;
const employee = db.employee;
const Role = db.role;
const department = db.departments;
const Op = db.Sequelize.op;
const appraisal = db.appraisal;
const expenses = db.expenses;
const notice = db.Notice;
const project = db.projects;
const projectDetail = db.ProjectsDetail;
const salary = db.salary;
const attendence = db.attendence;
const leave = db.leaves;
const task = db.tasks;
const LoanAndAdvance = db.loanAndAdvance;
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const { where } = require("sequelize");
const { emptyQuery } = require("pg-protocol/dist/messages");
///////////////////////////////////////////////////////////////////////////////////////
///////////////////////new correct adn updated backend/////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
exports.signup = async (req, res) => {
  // Save User to Database
  try {
    const exist = await employee.findOne({
      where: {
        email: req.body.email,
      },
    });
    if (exist == null) {
      User.create({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 8),
        retypepassword: req.body.retypepassword,
      })
        .then(
          employee.create({
            // id:req.body.id,
            username: req.body.firstname,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 8),
            // age:req.body.age,
            // // gender:req.body.gender,
            // contact:req.body.contact,
          })
        )
        .then((user) => {
          if (req.body.roles) {
            Role.findAll({
              where: {
                name: req.body.roles,
              },
            }).then((roles) => {
              user.setRoles(roles).then(() => {
                return res.send({ message: "User registered successfully!" });
              });
            });
          } else {
            // user role = 1  default role with ID 1
            user.setRoles([1]).then(() => {
              return res.send({ message: "User registered successfully!" });
            });
          }
        })
        .catch((err) => {
          console.log(err.message);
          return res.status(500).send({ message: err.message });
        });
    } else {
      return res
        .status(500)
        .send({ message: "sorry user email already exist" });
    }
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

exports.signin = (req, res) => {
  User.findOne({
    where: {
      email: req.body.email,
    },
  })
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }
      //valid
      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!",
        });
      }

      var token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 86400, // 24 hours
      });

      var authorities = [];
      user.getRoles().then((roles) => {
        for (let i = 0; i < roles.length; i++) {
          authorities.push("ROLE_" + roles[i].name.toUpperCase());
        }
        res.status(200).send({
          id: user.id,
          username: user.username,
          email: user.email,
          roles: authorities,
          accessToken: token,
        });
      });
    })
    .catch((err) => {
      return res.status(500).send({ message: err.message });
    });
};

//Add single employee
exports.addEmp = async (req, res) => {
  // Save User to Database
  try {
    const depEx = await department.findOne({
      where: {
        name: req.body.depName,
      },
    });
    const exist = await employee.findOne({
      where: {
        email: req.body.email,
      },
    });

    if (depEx != null && exist == null) {
      employee
        .create({
          // id:req.body.id,
          username: req.body.username,
          email: req.body.email,
          password: bcrypt.hashSync(req.body.password, 8),
          age: req.body.age,
          // gender:req.body.gender,
          contact: req.body.contact,
          d_id: depEx.id,
        })
        .then(res.status(200).send({ message: "Employee added successfully!" }))
        .then(
          User.create({
            firstname: req.body.username,
            // lastname:req.body.lastname,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 8),
            retypepassword: req.body.retypepassword,
          }).then((user) => {
            if (req.body.roles) {
              Role.findAll({
                where: {
                  name: req.body.roles,
                },
              }).then((roles) => {
                user.setRoles(roles).then(() => {
                  //res.send({ message: "User registered successfully!" });
                });
              });
            } else {
              // user role = 1
              user.setRoles([1]).then(() => {
                //res.send({ message: "User registered successfully!" });
              });
            }
          })
        )
        .catch((err) => {
          return res.status(500).send({ message: err.message });
        });
    } else {
      return res.send({
        message: "sorry email already exist or department is not present",
      });
    }
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};
//

//Add  update single employee
// exports.updateEmp = async (req, res) => {
//   try {
//     const exist = await employee.findOne({
//       where: {
//         username: req.body.username,
//       },
//     });

//     if (exist != null) {
//       await employee.update(
//         {
//           email: req.body.email,
//           password: bcrypt.hashSync(req.body.password, 8),
//           age: req.body.age,
//           contact: req.body.contact,
//         },
//         {
//           where: {
//             username: req.body.username,
//           },
//         }
//       );
//       await User.update(
//         {
//           firstname: req.body.username,
//           email: req.body.email,
//           password: bcrypt.hashSync(req.body.password, 8),
//           retypepassword: bcrypt.hashSync(req.body.retypepassword, 8),
//         },
//         {
//           where: {
//             email: req.body.email,
//           },
//         }
//       );
//       res
//         .status(200)
//         .send({ message: "Employee detail is updated successfully!" });
//     } else {
//       res.status(404).send({ message: "Employee not found" });
//     }
//   } catch (err) {
//     res.status(500).send({ message: err.message });
//   }
// };
exports.updateEmp = async (req, res) => {
  try {
    const exist = await employee.findOne({
      where: {
        username: req.body.username,
      },
    });

    if (exist != null) {
      // Check if the department exists before updating
      const depEx = await department.findOne({
        where: {
          name: req.body.depName,
        },
      });

      if (depEx != null) {
        await employee.update(
          {
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 8),
            age: req.body.age,
            contact: req.body.contact,
            d_id: depEx.id, // Update the department ID
          },
          {
            where: {
              username: req.body.username,
            },
          }
        );

        await User.update(
          {
            firstname: req.body.username,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 8),
            retypepassword: bcrypt.hashSync(req.body.retypepassword, 8),
          },
          {
            where: {
              email: req.body.email,
            },
          }
        );

        res
          .status(200)
          .send({ message: "Employee detail is updated successfully!" });
      } else {
        res.status(404).send({ message: "Department not found" });
      }
    } else {
      res.status(404).send({ message: "Employee not found" });
    }
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

//Add  delete single employee
exports.deleteEmp = async (req, res) => {
  // Save User to Database
  try {
    const exist = await employee.findOne({
      where: {
        username: req.body.username,
      },
    });
    if (exist != null) {
      employee
        .delete({
          // id:req.body.id,
          username: req.body.username,
          email: req.body.email,
          password: bcrypt.hashSync(req.body.password, 8),
          age: req.body.age,
          // gender:req.body.gender,
          contact: req.body.contact,
        })
        .then(
          res
            .status(200)
            .send({ message: "Employee detail is updated successfully!" })
        )
        .then(
          User.delete({
            firstname: req.body.username,
            // lastname:req.body.lastname,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 8),
            retypepassword: bcrypt.hashSync(req.body.retypepassword, 8),
          }).then((user) => {
            if (req.body.roles) {
              Role.findAll({
                where: {
                  name: req.body.roles,
                },
              }).then((roles) => {
                user.setRoles(roles).then(() => {
                  //res.send({ message: "User registered successfully!" });
                });
              });
            } else {
              // user role = 1
              user.setRoles([1]).then(() => {
                //res.send({ message: "User registered successfully!" });
              });
            }
          })
        )
        .catch((err) => {
          res.status(500).send({ message: err.message });
        });
    }
  } catch {
    res.status(500).send({ message: err.message });
  }
};
//Add bullk employee
exports.addBulkEmp = (req, res) => {
  // Save User to Database
  employee
    .bulkCreate({
      username: req.body.username,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 8),
      age: req.body.age,
      gender: req.body.gender,
      contact: req.body.contact,
    })
    .then((user) => {
      if (req.body.roles) {
        Role.findAll({
          where: {
            username: {
              [Op.or]: req.body.roles,
            },
          },
        }).then((roles) => {
          user.setRoles(roles).then(() => {
            res.send({ message: "Employee added successfully!" });
          });
        });
      } else {
        // user role = 1
        user.setRoles([1]).then(() => {
          res.send({ message: "Employee added successfully!" });
        });
      }
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};
//update employee
// exports.updateEmp = async (req, res) => {
//   // Save User to Database
// let update = await User.update({
//   username: req.body.username,
//   email: req.body.email,
//   password: bcrypt.hashSync(req.body.password, 8),
//   age:req.body.age,
//   gender:req.body.gender,
//   contact:req.body.contact,
// },
// where:

// )

// };
//Add single department
exports.adddepart = (req, res) => {
  // Save User to Database
  department
    .create({
      d_id: req.body.d_id,
      name: req.body.name,
      desc: req.body.desc,
    })
    .then(res.status(200).send({ message: "department added successfully" }))
    .catch((err) => {
      return res.status(500).send({ message: err.message });
    });
};

//Add single appraisal
exports.addAppraisal = (req, res) => {
  // Save Appraisal to Database
  appraisal
    .create({
      id: req.body.id,
      name: req.body.name,
      appraisal: req.body.appraisal,
    })
    .then(returnres.status(200).send("Appraisals is added successfully"))
    .catch((err) => {
      return res.status(500).send({ message: err.message });
    });
};
//Add single Salary
exports.addSalary = async (req, res) => {
  const exist = await employee.findOne({
    where: {
      username: req.body.EmpName,
    },
  });
  console.log(exist);

  if (exist != null) {
    salary
      .create({
        month: req.body.month,
        annual: req.body.annual,
        basic_pay: req.body.basic_pay,
        bonus: req.body.bonus,
        e_id: exist.id,
      })
      .then(res.status(200).send("salary added successfully"))
      .catch((err) => {
        return res.status(500).send({ message: err.message });
      });
  }
};

// show Salary by id
exports.ShowSalaryofEmployee = async (req, res) => {
  try {
    const exist = await employee.findOne({
      where: {
        id: req.params.id,
      },
    });
    if (exist != null) {
      // const id = exist.id;
      let data = await db.sequelize.query(
        'select s."id",e."username" as emp_name,s."month",s."annual",s."basic_pay",s."bonus" from "Employees"  as e  inner join "Salaries" as s on s.e_id = e.id where e.id=' +
          req.params.id,
        {
          type: QueryTypes.SELECT,
        }
      );
      return res.status(200).json(data);
    } else {
      return res.status(500).send({
        message:
          "sorry the name of employee is not register and you cannot add attendence for him",
      });
    }
  } catch (error) {
    return res.status(500).send("internal server error");
  }
};
// show all Salary
exports.ShowAllSalaries = async (req, res) => {
  try {
    //   const exist = await employee.findOne({
    //   where:{
    //     id: req.params.id
    //   }
    // })
    // if(exist!=null){
    //   const id = exist.id;
    let data = await db.sequelize.query(
      'select e."username" as emp_name, s."month",s."annual",s."basic_pay",s."bonus" from "Employees"  as e  inner join "Salaries" as s on s.e_id = e.id',
      {
        type: QueryTypes.SELECT,
      }
    );
    return res.status(200).json(data);
    // }else{
    //   res.status(500).send({ message: "sorry the name of employee is not register and you cannot add attendence for him" });
    // }
  } catch (error) {
    return res.status(500).send("internal server error");
  }
};
// Add single expenses
exports.addExpenses = async (req, res) => {
  try {
    // Save expenses to Database
    const exist = await employee.findOne({
      where: {
        username: req.body.submitted_by,
      },
    });

    if (exist != null) {
      await expenses.create({
        name: req.body.name,
        submitted_by: req.body.submitted_by,
        amount: req.body.amount,
        date: req.body.date,
        apply_for: req.body.apply_for,
        e_id: exist.id,
      });

      res.status(200).send("Expense added successfully");
    } else {
      res.status(404).send({ message: "Employee not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

//show expence detail by employee id
exports.showExpenceById = async (req, res) => {
  try {
    const exist = await employee.findOne({
      where: {
        id: req.params.id,
      },
    });
    if (exist != null) {
      const id = req.params.id;
      //SELECT * from public."LoanAndAdvances" where "EmpName" = 'waqas'
      const data = await db.sequelize.query(
        'select e."username" as EmpName, ex."name" as expenseName,ex."amount",ex."date",ex."apply_for"   from "Employees"  as e  inner join "Expenses" as ex  on ex.e_id = e.id where e.id=' +
          req.params.id,
        {
          type: QueryTypes.SELECT,
        }
      );
      // let response = {
      //     'data': data
      // }
      return res.status(200).json(data);
    } else {
      return res
        .status(200)
        .send({ message: "sorry the name you have given is not register" });
    }
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};
//bulk expenses
exports.addBulkExpenses = (req, res) => {
  // Save expenses to Database
  expenses
    .bulkCreate({
      ex_id: req.body.ex_id,
      name: req.body.name,
      submitted_by: req.body.submitted_by,
      amount: req.body.amount,
      date: req.body.date,
      apply_for: req.body.apply_for,
    })
    .catch((err) => {
      return res.status(500).send({ message: err.message });
    });
};
//add notice
exports.addNotice = (req, res) => {
  // Save expenses to Database
  notice
    .create({
      id: req.body.id,
      notice_title: req.body.notice_title,
      detail: req.body.detail,
      d_id: req.body.d_id,
    })
    .then(res.status(200).send("Notice is added successfully"))
    .catch((err) => {
      return res.status(500).send({ message: err.message });
    });
};
//add salary
// exports.addSalary = (req, res) => {
//   // Save expenses to Database
//   salary.create({
//     s_id:req.body.s_id,
//     month:req.body.month,
//     annual:req.body.annual,
//     basic_pay:req.body.basic_pay,
//     bonus:req.body.bonus,
//     e_id:req.body.e_id
//   })
//     .catch(err => {
//       res.status(500).send({ message: err.message });
//     });
//   }
//add projects
exports.addProjects = async (req, res) => {
  const exist = await employee.findOne({
    where: {
      //EmpName : {in database}
      username: req.body.EmpName,
    },
  });
  // Save projects to Database
  if (exist != null) {
    project
      .create({
        p_id: req.body.p_id,
        name: req.body.name,
        desc: req.body.desc,
        status: req.body.status,
        assignDate: req.body.assignDate,
        e_id: exist.id, //EmpName
      })
      .then(res.status(200).send("Project is added successfully"))
      .catch((err) => {
        return res.status(500).send({ message: err.message });
      });
  } else {
    return res.send({
      message: "sorry the employee name you enter is not register ",
    });
  }
};
//show projects by employee id
exports.showProjects = async (req, res) => {
  try {
    const exist = await employee.findOne({
      where: {
        id: req.params.id,
      },
    });
    if (exist != null) {
      const id = req.params.id;
      //SELECT * from public."LoanAndAdvances" where "EmpName" = 'waqas'
      const data = await db.sequelize.query(
        'select e."username" as EmpName, p."name" as Projectname,p."desc",p."status",p."assignDate"   from "Employees"  as e  inner join "projects" as p  on p.e_id = e.id where e.id=' +
          req.params.id,
        {
          type: QueryTypes.SELECT,
        }
      );
      // let response = {
      //     'data': data
      // }
      return res.status(200).json(data);
    } else {
      res
        .status(200)
        .send({ message: "sorry the id you have given is not register" });
    }
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};
//show all projects
exports.showAllProjects = async (req, res) => {
  try {
    // const exist = await employee.findOne({
    //   where:{
    //     id: req.params.id
    //   }
    // })
    //   if(exist!=null){
    //     const id = req.params.id;

    const data = await db.sequelize.query(
      'select e."username" as EmpName, p."name" as Projectname,p."desc",p."status",p."assignDate"   from "Employees"  as e  inner join "projects" as p  on p.e_id = e.id',
      {
        type: QueryTypes.SELECT,
      }
    );
    // let response = {
    //     'data': data
    // }
    return res.status(200).json(data);
    // }
    // else{
    //   res.status(200).send({'message':"sorry the id you have given is not register"});
    // }
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};
//add projectsdetails
exports.addProjectsDetails = (req, res) => {
  // Save projectsdetails to Database
  projectDetail
    .create({
      // id:req.body.id,
      name: req.body.name,
      type: req.body.type,
      desc: req.body.desc,
      // bonus: req.body.bonus,
      p_id: req.body.p_id,
    })
    .then(res.status(200).send("Project details is added successfully"))
    .catch((err) => {
      return res.status(500).send({ message: err.message });
    });
};
//add Attendence
exports.addAttendence = async (req, res) => {
  const exist = await employee.findOne({
    where: {
      username: req.body.EmpName,
    },
  });
  console.log(exist);
  if (exist != null) {
    attendence
      .create({
        status: req.body.status,
        date: req.body.date,
        check_in: req.body.check_in,
        check_out: req.body.check_out,
        e_id: exist.id,
      })
      .then(res.status(200).send("Attendence is added successfully"))
      .catch((err) => {
        return res.status(500).send({ message: err.message });
      });
  } else {
    return res.status(500).send({
      message:
        "sorry the name of employee is not register and you cannot add attendence for him",
    });
  }
};
//add Leaves
exports.addLeave = (req, res) => {
  // Save projectsdetails to Database
  leave
    .create({
      // id:req.body.id,
      date: req.body.date,
      desc: req.body.desc,
    })
    .then(res.status(200).send("leave is added successfully"))
    .catch((err) => {
      return res.status(500).send({ message: err.message });
    });
};

//add Task
exports.addTask = async (req, res) => {
  const exist = await employee.findOne({
    where: {
      username: req.body.EmpName,
    },
  });
  // Save Task to Database
  if (exist != null) {
    task
      .create({
        // t_id:req.body.t_id,

        name: req.body.name,
        desc: req.body.desc,
        start: req.body.start,
        end: req.body.end,
        e_id: exist.id,
      })
      .then(res.status(200).send("task is added successfully"))
      .catch((err) => {
        return res.status(500).send({ message: err.message });
      });
  } else {
    return res.send({
      message: "sorry the employee name you enter is not register",
    });
  }
};
//show tasks detail by employee id
exports.showTasksByid = async (req, res) => {
  try {
    const exist = await employee.findOne({
      where: {
        id: req.params.id,
      },
    });
    if (exist != null) {
      //SELECT * from public."LoanAndAdvances" where "EmpName" = 'waqas'
      const data = await db.sequelize.query(
        'select e."username" as EmpName, t."name" as TaskName,t."desc",t."start",t."end"  from "Employees"  as e inner join "Tasks" as t on t.e_id = e.id where e.id=' +
          req.params.id,
        {
          type: QueryTypes.SELECT,
        }
      );
      // let response = {
      //     'data': data
      // }
      return res.status(200).json(data);
    } else {
      return res
        .status(200)
        .send({ message: "sorry the id you have given is not register" });
    }
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};
//add Loan or Advance
exports.LoanAndAdvance = async (req, res) => {
  const exist = await employee.findOne({
    where: {
      username: req.body.EmpName,
    },
  });
  // console.log(exist);
  if (exist != null) {
    LoanAndAdvance.create({
      // id:req.body.id,
      // EmpName:req.body.EmpName,
      // EmpId:req.body.EmpId,
      Amount: req.body.Amount,
      // Phone_no:req.body.Phone_no,
      // Email:req.body.Email,
      Apply_for: req.body.Apply_for,
      Shift: req.body.Shift,
      Status: req.body.Status,
      e_id: exist.id,
    })
      .then(res.status(200).send("Loan Request is done"))
      .catch((err) => {
        return res.status(500).send({ message: err.message });
      });
  } else {
    return res.status(500).send({
      message:
        "sorry the name of employee is not register and cannot apply for loan",
    });
  }
};

//show loan and advance detail by employee id
exports.showloanAndAdvance = async (req, res) => {
  try {
    const exist = await employee.findOne({
      where: {
        id: req.params.id,
      },
    });
    if (exist != null) {
      const id = req.params.id;
      //SELECT * from public."LoanAndAdvances" where "EmpName" = 'waqas'
      const data = await db.sequelize.query(
        'select e."username" as EmpName,l."createdAt",l."Amount",l."Apply_for",l."Status" from "Employees"  as e inner join "LoanAndAdvances" as l on l.u_id = e.id where e.id=' +
          req.params.id,
        {
          type: QueryTypes.SELECT,
        }
      );
      let response = {
        data: data,
      };
      return res.status(200).json(response);
    } else {
      return res
        .status(200)
        .send({ message: "sorry the id you have given is not register" });
    }
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};
//show attendece detail by employee name
exports.showAttendencebyName = async (req, res) => {
  try {
    const exist = await employee.findOne({
      where: {
        username: req.params.name,
      },
    });

    if (exist) {
      //SELECT * from public."LoanAndAdvances" where "EmpName" = 'waqas'
      const data = await db.sequelize.query(
        'select e."username" as EmpName,a."date",a."status",a."check_in",a."check_out" from "Employees"  as e   inner join "attendences" as a   on a.e_id = e.id where e.id=' +
          exist.id,
        {
          type: QueryTypes.SELECT,
        }
      );
      // let response = {
      //     'data': data
      // }
      return res.status(200).json(data);
    } else {
      return res.status(200).send({
        message: "sorry the Name of employee you have given is not register",
      });
    }
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};
//show attendece detail by employee id
exports.showAttendencebyid = async (req, res) => {
  try {
    const exist = await employee.findOne({
      where: {
        id: req.params.id,
      },
    });

    if (exist) {
      //SELECT * from public."LoanAndAdvances" where "EmpName" = 'waqas'
      const data = await db.sequelize.query(
        'select e."username" as EmpName,a."date",a."status",a."check_in",a."check_out" from "Employees"  as e   inner join "attendences" as a   on a.e_id = e.id where e.id=' +
          exist.id,
        {
          type: QueryTypes.SELECT,
        }
      );
      // let response = {
      //     'data': data
      // }
      return res.status(200).json(data);
    } else {
      return res.status(200).send({
        message: "sorry the Name of employee you have given is not register",
      });
    }
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

//show all attendece detail
exports.showAllAttendence = async (req, res) => {
  try {
    // const exist = await employee.findOne({
    //   where:{
    //     id: req.params.id
    //   }
    // })
    // if(exist!=null){
    // const id = req.params.id;
    //SELECT * from public."LoanAndAdvances" where "EmpName" = 'waqas'
    const data = await db.sequelize.query(
      'SELECT * FROM public."attendences";',
      {
        type: QueryTypes.SELECT,
      }
    );
    // let response = {
    //     'data': data
    // }
    return res.status(200).json(data);
    // }
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};
//show all notices detail
exports.showNotices = async (req, res) => {
  try {
    // const id = req.params.id;
    //SELECT * from public."LoanAndAdvances" where "EmpName" = 'waqas'

    const data = await db.sequelize.query('SELECT * FROM public."Notices";', {
      type: QueryTypes.SELECT,
    });
    // let response = {
    //     'data': data
    // }
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};
exports.findEMployee = async (req, res) => {
  const result = employee.findOne({
    where: {
      username: req.params.name,
    },
  });
  const response = {
    Employee: result,
  };
  return res.send(response);
};
