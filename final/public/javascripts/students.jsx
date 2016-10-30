class AdminInterface extends React.Component {


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
        error: AdminInterface.requestError
    });
    }

    shake(){
        var $formContainer = $('#formula');
        $formContainer.addClass('invalid');
        setTimeout(function () {
            $formContainer.removeClass('invalid');
        }, 500);
    }


    registerMac(){
        return (e) => {
            e.preventDefault();
            let mac = $('#macInput').val();
            console.log("here-------------");
            if(mac.length == this.MAC_LENGTH) {
                $.ajax({
                    url: '/student/registermac',
                    data: {mac:mac},
                    dataType: "application/json",
                    method: "POST",
                    success: () => {
                        console.log("success");
                        alert("Your'e in,\nif the MAC is incorrect it's imperative that you update it.");
                    },
                    error: (jqXHR)=> {
                        AdminInterface.requestError('MAC Error', jqXHR);
                    }
                });
            }
            else{
                console.log("bad input")
                this.shake()
            }
            return false;

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
    <td data-th="Course name">{this.state.courses[key].name}</td>
        <td data-th="Course Number">{this.state.courses[key].classId}</td>
        <td data-th="Attendence">{this.state.courses[key].attendance}</td>
        </tr>
    )
    });
        return (
            <section>
                <div className="registerMacDiv">
                    <form id="formula" onSubmit={this.registerMac().bind(this)}>
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


ReactDOM.render(React.createElement(AdminInterface), document.getElementById("courseListContainer"));
