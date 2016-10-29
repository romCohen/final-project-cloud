/**
 * Created by omer on 28/10/2016.
 */
class AdminInterface extends React.Component {

    constructor() {
        super();
        this.state = {students: [], classes:[], lecturers:[]};
        this.getCourses();

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
      id = null;//TODO
      courses = null;
      password = null;
      $.ajax({url: '/admin/addLecturer',
          dataType: 'json',
          'Content-type': 'application/json',
          method: "POST",
          data:{'id': id, 'classList':courses, 'password':password},
          success: (res) => {
              alert('Great Success');
              var state = this.state;
              state.lecturers.add(lecturer);
          },
          error: (err)=>{
              alert(err.message);
              console.log(err);
          }
      });
    }

  createClass(){
      var id = null;//TODO
      var courses = null;
      var password = null;
      var student = {'id': id, 'studentList':studentList, 'lecturerId':instructorId, 'roomId': roomId, 'schedule': schedule };
      $.ajax({url: '/admin/addClass',
          dataType: 'json',
          'Content-type': 'application/json',
          method: "POST",
          data:student,
          success: (res) => {
              alert('Great Success');
              var state = this.state;
              state.students.add(student)
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

    shake(){
        var $formContainer = $('#registerMacDiv');
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

    render() {
        var courseList = Object.keys(this.state.courses).map((key, i) => {
            return (
                <tr key={i}>
                    <td data-th="Course name">{this.state.courses[key].name}</td>
                    <td data-th="Course Number">{this.state.courses[key].number}</td>
                    <td data-th="Attendence">{this.state.courses[key].attendance}</td>
                </tr>
            )
        });
        var studentList = Object.keys(this.state.students).map((key, i) => {
            return (
                <tr key={i}>
                    <td data-th="Course name">{this.state.courses[key].name}</td>
                    <td data-th="Course Number">{this.state.courses[key].id}</td>
                    <td data-th="Attendence">{this.state.courses[key].MAC}</td>
                </tr>
            )
        });


        return (
            <section>

                <div id='main'>
                    <div class='container'>
                        //Course table ------------------------------------------------------------------
                        <table id="Courses">
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
                                <th>Attendence</th>
                            </tr>
                            </thead>
                            <tbody>{courseList}</tbody>
                        </table>
                        //--------------------------------------------------------------------------------
                        //Students------------------------------------------------------------------------
                        <table id="Students">
                            <colgroup>
                                <col style={{width:'20%'}}></col>
                                <col style={{width:'20%'}}></col>
                                <col style={{width:'50%'}}></col>
                                <col style={{width:'10%'}}></col>
                            </colgroup>
                            <thead>
                            <tr>
                                <th>Student name</th>
                                <th>Id Number</th>
                                <th>MAC</th>
                            </tr>
                            </thead>
                            <tbody>{studentList}</tbody>
                        </table>
                        //Edit-----------------------------------------------------------------------------
                        <div id="editPanel">
                            <form>
                                Add Course<br>
                                <input type="text" value="username"/>

                                <input type="password"/>

                                <input type="submit"/>

                            </form>
                            <form>
                                Add Course<br>
                                <input type="text" value="username"/>

                                <input type="password"/>

                                <input type="submit"/>

                            </form>
                        </div>
                        <navbar class="fixed-top">
                            <div class='nav-fostrap'>
                                <ul>
                                    <li><a href='#' >Courses</a> </li>
                                    <li><a hrf='#' >Students</a> </li>
                                    <li><a href='#' >Edit</a></li>
                                    <li><a href='#'>Help<span class='arrow-down'></span></a>
                                        <ul class='dropdown'>
                                            <li><a href=''>Manual</a></li>
                                            <li><a href=''>About</a></li>
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
