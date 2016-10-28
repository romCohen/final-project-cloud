class CourseAttendance extends React.Component {


    constructor() {
        super();
        this.state = {courses: []};
        this.getCourses();
        this.MAC_LENGTH = 17;
        this.ID_LENGTH = 9;
    }

    getCourses() {
        $.ajax({
                url: '/students/data',
                dataType: 'json',
                'Content-type': 'application/json',
                method: "GET",
                success: (res) => {
                this.setState({courses: res})
                console.log(res)
    },
        error: CourseAttendance.requestError
    });
    }

    shake(){
        var $formContainer = $('#registerMacDiv');
        $formContainer.addClass('invalid');
        setTimeout(function () {
            $formContainer.removeClass('invalid');
        }, 500);
    }


    registerMac(){
        return () => {
            let mac = $('#macInput').val();
            let id = $('#idInput').val;
            if(mac.length == this.MAC_LENGTH || id.toString().length == this.ID_LENGTH) {
                $.ajax({
                    url: '/student/registermac',
                    data: {id: $('idInput').val(), mac: $('macInput').val()},
                    dataType: "application/json",
                    method: "POST",
                    success: () => {
                        console.log("success");
                        alert("Your'e in,\nif the MAC is incorrect it's imperative that you update it.");
                    },
                    error: (jqXHR)=> {
                        CourseAttendance.requestError('MAC Error', jqXHR);
                    }
                });
            }
            else{
                this.shake()
            }
        }
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
    <td data-th="Course name">{this.state.courses[key]._id}</td>
        <td data-th="Course Number">{this.state.courses[key].classId}</td>
        <td data-th="Attendence">{this.state.courses[key].attendance}</td>
        </tr>
    )
    });
        return (
            <section>
                <div className="registerMacDiv">
                    <form onSubmit={this.registerMac.bind(this)}>
                        <input id="idInput" placeholder="Id number" type="number" required/>
                        <input id="macInput" placeholder="MAC" type="text" required/>
                        <button>Register</button>
                    </form>
                </div>
                <table id="CourseAttendanceTable">
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
        </section>)
    }

}


ReactDOM.render(React.createElement(CourseAttendance), document.getElementById("courseListContainer"));
