/**
 * Created by omer on 28/10/2016.
 */
class AdminInterface extends React.Component {

    constructor() {
        super();
        this.state = {students: [], classes:[], lecturers:[]};
        this.currentPanel = 0;
        this.getAll("classes");
        this.getAll("students");
        this.getAll("lecturers");

    }
    componentDidMount(){
        this.panels = [$('#Courses'), $('#Students'), $('#Lecturers'), $('#editPanel'), $('#Manual'), $('#About')];
        for(var i = 1; i< this.panels.length; i++)this.panels[i].hide();
    }
    getCourseAttendance(course){
        $.ajax({url: '/admin/Lecturer/class/' + course,
            method: 'GET',
            success: (res)=>{
                //TODO:update relevant ui
            },
            error: AdminInterface.requestError

        })
    }

    addLecturer(){
        var id = $("#id1").val();//TODO
        var password = $("#pass1").val();
        var name = $("#name1").val();
        var lecturer = {'id': id, 'password':password, 'name':name};

      $.ajax({url: '/admin/addLecturer',
          dataType: 'json',
          'Content-type': 'application/json',
          method: "POST",
          data:lecturer,
          success: (res) => {
              alert('Great Success');
              var state = this.state;
              state.lecturers.add(lecturer);
              this.setState(state);
          },
          error: (err)=>{
              alert(err.message);
              console.log(err);
          }
      });
    }

  createClass(){
      var id = null;//TODO
      var studentList = null;
      var instructorId = null;
      var roomId = null;
      var schedule = null;

      var course = {'id': id, 'studentList':studentList, 'lecturerId':instructorId, 'roomId': roomId, 'schedule': schedule };
      $.ajax({url: '/admin/addClass',
          dataType: 'json',
          'Content-type': 'application/json',
          method: "POST",
          data:course,
          success: (res) => {
              alert('Great Success');
              var state = this.state;
              state.students.add(course)
              this.setState(state);
          },
          error: (err)=>{
              alert(err.message);
              console.log(err);
          }
      });
  }


  getAll(tableName) {
        $.ajax({url: '/admin/' + tableName,
            dataType: 'json',
            'Content-type': 'application/json',
            method: "GET",
            success: (res) => {
                let state = this.state;
                state[tableName] = res;
                this.setState(state);
            },
            error: AdminInterface.requestError
        });
    }

    shake(containter){
        var $formContainer = $(containter);
        $formContainer.addClass('invalid');
        setTimeout(function () {
            $formContainer.removeClass('invalid');
        }, 500);
    }




    static requestError(error, jqXHR, textStatus, errorThrown) {
        if (jqXHR.status === 409) {
            alert(error);
        }
        console.log("Ajax Error: " + textStatus, errorThrown);
    }

    changePanel(to){
        return function(e){
            e.preventDefault();
            this.panels[this.currentPanel].hide();
            this.panels[to].show();
            this.currentPanel = to;
            return false;
        }
    }

    render() {
        console.log(this.currentPanel);
        var courseList = Object.keys(this.state.classes).map((key, i) => {
            return (
                <tr key={i}>
                    <td data-th="Course name">{this.state.classes[key].name}</td>
                    <td data-th="Course Number">{this.state.classes[key].id}</td>
                    <td data-th="Attendence">{this.state.classes[key].Students.toString()}</td>
                </tr>
            )
        });
        var studentList = Object.keys(this.state.students).map((key, i) => {
            var classIds = []
            this.state.students[key].classes.forEach((course)=>{
               classIds.push(course.classId);
            });
            return (
                <tr key={i}>
                    <td data-th="Course Number">{this.state.students[key].id}</td>
                    <td data-th="Attendence">{this.state.students[key].MAC}</td>
                    <td data-th="Course name">{classIds.toString()}</td>
                </tr>
            )
        });
        var lecturerList = Object.keys(this.state.lecturers).map((key, i) => {
            console.log(this.state.lecturers[key]);
            return (
                <tr key={i}>
                    <td data-th="Instructor id Number">{this.state.lecturers[key].id}</td>
                    <td data-th="Courses">{this.state.lecturers[key].classes.toString()}</td>
                </tr>
            )
        });
``

        return (
            <section>

                <div id='main'>
                    <div className='container'>
                        <div id="Courses" style={{visibility:'visible'}}>
                            <table >
                                <colgroup>
                                    <col style={{width:'20%'}}></col>
                                    <col style={{width:'20%'}}></col>
                                    <col style={{width:'50%'}}></col>
                                    <col style={{width:'10%'}}></col>
                                </colgroup>
                                <thead>
                                <tr>
                                    <th>Course name</th>
                                    <th>Course Number</th>
                                    <th>Students</th>
                                </tr>
                                </thead>
                                <tbody>{courseList}</tbody>
                            </table>
                        </div>
                        <div id="Students" style={{visibility:'visible'}}>
                            <table>
                                <colgroup>
                                    <col style={{width:'20%'}}></col>
                                    <col style={{width:'20%'}}></col>
                                    <col style={{width:'50%'}}></col>
                                    <col style={{width:'10%'}}></col>
                                </colgroup>
                                <thead>
                                <tr>
                                    <th>Student Id</th>
                                    <th>MAC</th>
                                    <th>Courses</th>
                                </tr>
                                </thead>
                                <tbody>{studentList}</tbody>
                            </table>
                        </div>
                        <div id="Lecturers" >
                            <table>
                                <colgroup>
                                    <col style={{width:'20%'}}></col>
                                    <col style={{width:'20%'}}></col>
                                    <col style={{width:'50%'}}></col>
                                    <col style={{width:'10%'}}></col>
                                </colgroup>
                                <thead>
                                <tr>
                                    <th>Id Number</th>
                                    <th>Courses</th>
                                </tr>
                                </thead>
                                <tbody>{lecturerList}</tbody>
                            </table>
                        </div>
                        <div id="editPanel" style={{visibility:'visible'}}>
                            <form>
                                Add Lecturer<br/>
                                <input type="text" placeholder="Name" id="name1"/>
                                <input type="text" placeholder="Id number" id="id1"/>
                                <input type="text" placeholder="Password" id="pass1"/>
                                <input type="submit"/>
                            </form>

                            <form>
                                Add Course<br/>
                                <input type="text" placeholder="Course Title" id="name2"/>

                                <input type="password"/>

                                <input type="submit"/>

                            </form>
                        </div>
                        <div id="Manual" style={{visibility:'visible'}}>
                            <b>This is an inteface for viewing and managing the attendace system,</b><br/><br/>
                            the first three tabs(from the left) allow you to view the database directly<br/>
                            the fourth tab allows you to add both users and Courses for which attendance will be taken.

                        </div>
                        <div id="About" style={{visibility:'visible'}}>
                            <p>If you removed all of a person's veins and arteries,</p><p>and laid them end to end,</p><h4>then that person will die.</h4>
                        </div>
                        <navbar className="fixed-top">
                            <div className='nav-fostrap'>
                                <ul>
                                    <li><a href='javascript:;' onClick={(this.changePanel(0)).bind(this)} >Courses</a> </li>
                                    <li><a href='javascript:;' onClick={(this.changePanel(1)).bind(this)} >Students</a> </li>
                                    <li><a href='javascript:;' onClick={(this.changePanel(2)).bind(this)} >Lecturers</a> </li>
                                    <li><a href='javascript:;' onClick={(this.changePanel(3)).bind(this)} >Edit</a></li>
                                    <li><a href='javascript:;' onClick={(e)=>{e.preventDefault(); return false;}}>Help<span className='arrow-down'></span></a>
                                        <ul className='dropdown'>
                                            <li><a href='javascript:;' onClick={(this.changePanel(4)).bind(this)} >Manual</a></li>
                                            <li><a href='javascript:;' onClick={(this.changePanel(5)).bind(this)} >About</a></li>
                                        </ul>
                                    </li>
                                </ul>
                            </div>
                        </navbar>
                    </div>
                </div>
            </section>)
    }

}





ReactDOM.render(React.createElement(AdminInterface), document.getElementById("courseListContainer"));
